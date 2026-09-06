#!/usr/bin/env python3
"""Patch MINIMAL qwen3-asr.cpp : hallucination post-decode filter SEUL.
PAS de VAD (doublonnerait avec NeuralVad client), PAS de flags CLI,
PAS de silence check serveur. ~15 lignes.

Applique juste :
  1. known_hallucinations() + strip_asr_hallucinations() helpers
  2. Wrap response_json avec strip
  3. Wrap response_verbose_json avec strip
  4. Wrap text response avec strip
"""
import sys, shutil, os

SRC = "/home/john/qwen3-asr.cpp/src/server.cpp"
BAK = SRC + ".prepatch.bak"

if not os.path.exists(BAK):
    shutil.copy2(SRC, BAK)
    print(f"[backup] {BAK}")

with open(SRC, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Helpers : inserer juste avant response_json
HELPERS = [
    "// ─── ANTI-HALLUCINATION POST-DECODE FILTER (minimal) ────────────\n",
    "// Strippe les hallucinations connues en FIN de transcript uniquement.\n",
    "// PAS de VAD ici : le VAD est deja cote client (NeuralVad ONNX).\n",
    "// PAS de silence check : on laisse le modele decider.\n",
    "// Ref: github.com/openai/whisper/discussions/928\n",
    "\n",
    "static const std::vector<std::string> & known_hallucinations() {\n",
    "    static const std::vector<std::string> H = {\n",
    "        \"Sous-titrage ST' 501\",\n",
    "        \"Sous-titrage ST'\",\n",
    "        \"Sous-titrage\",\n",
    "        \"Sous-titres\",\n",
    "        \"Sous-titre par\",\n",
    "        \"Sous-titre\",\n",
    "        \"Transcription en francais\",\n",
    "        \"Transcription en français\",\n",
    "        \"Transcription\",\n",
    "        \"Abonnez-vous\",\n",
    "        \"Abonnez vous\",\n",
    "        \"Like and subscribe\",\n",
    "        \"Merci d'avoir regarde\",\n",
    "        \"Merci d'avoir ecoute\",\n",
    "        \"A bientot\",\n",
    "        \"À bientot\",\n",
    "        \"À bientôt\",\n",
    "        \"Au revoir\",\n",
    "    };\n",
    "    return H;\n",
    "}\n",
    "\n",
    "static std::string strip_asr_hallucinations(std::string text) {\n",
    "    while (!text.empty() && std::isspace(static_cast<unsigned char>(text.back()))) {\n",
    "        text.pop_back();\n",
    "    }\n",
    "    bool changed = true;\n",
    "    int safety = 8;\n",
    "    while (changed && safety-- > 0 && !text.empty()) {\n",
    "        changed = false;\n",
    "        const std::string lower = lower_copy(text);\n",
    "        for (const auto & h : known_hallucinations()) {\n",
    "            if (lower.size() < h.size()) continue;\n",
    "            const size_t off = lower.size() - h.size();\n",
    "            if (lower.compare(off, h.size(), h) == 0) {\n",
    "                text.erase(off);\n",
    "                while (!text.empty() && std::isspace(static_cast<unsigned char>(text.back()))) {\n",
    "                    text.pop_back();\n",
    "                }\n",
    "                changed = true;\n",
    "                break;\n",
    "            }\n",
    "        }\n",
    "    }\n",
    "    return text;\n",
    "}\n",
    "\n",
]

# Trouver la ligne "static std::string response_json(" et inserer avant
inserted = False
for i, line in enumerate(lines):
    if "static std::string response_json(const std::string & raw_text)" in line:
        for j, hl in enumerate(HELPERS):
            lines.insert(i + j, hl)
        inserted = True
        print("[1/4] helpers inseres")
        break

if not inserted:
    print("[FAIL] response_json not found")
    sys.exit(1)

# 2. response_json wrap
patched = False
for i, line in enumerate(lines):
    if line.strip() == "const std::string text = extract_transcript(raw_text);":
        # Verifier que c'est dans response_json (la prochaine ligne non-vide est return std::string)
        for j in range(i+1, min(i+4, len(lines))):
            if "json_escape(text)" in lines[j] and "extract_transcript" in lines[i]:
                # Verifier que c'est response_json (pas verbose_json)
                for k in range(i-1, max(0, i-5), -1):
                    if "response_json" in lines[k] and "verbose_json" not in lines[k]:
                        lines[i] = "    std::string text = strip_asr_hallucinations(extract_transcript(raw_text));\n"
                        patched = True
                        print("[2/4] response_json wrap")
                        break
                break
        if patched:
            break

if not patched:
    print("[FAIL] response_json text line not found")
    sys.exit(2)

# 3. response_verbose_json wrap
patched2 = False
for i, line in enumerate(lines):
    if line.strip() == "const std::string text = extract_transcript(raw_text);":
        # Verifier que c'est dans response_verbose_json
        for k in range(i-1, max(0, i-5), -1):
            if "response_verbose_json" in lines[k]:
                lines[i] = "    std::string text = strip_asr_hallucinations(extract_transcript(raw_text));\n"
                patched2 = True
                print("[3/4] response_verbose_json wrap")
                break
        if patched2:
            break

if not patched2:
    print("[FAIL] response_verbose_json text line not found")
    sys.exit(3)

# 4. text response wrap
patched3 = False
for i, line in enumerate(lines):
    if 'res.set_content(extract_transcript(result.text), "text/plain; charset=utf-8");' in line:
        lines[i] = '            res.set_content(strip_asr_hallucinations(extract_transcript(result.text)), "text/plain; charset=utf-8");\n'
        patched3 = True
        print("[4/4] text response wrap")
        break

if not patched3:
    print("[FAIL] text response wrap not found")
    sys.exit(4)

with open(SRC, "w", encoding="utf-8") as f:
    f.writelines(lines)

print()
print("=== SUMMARY ===")
print(f"File size: {os.path.getsize(SRC)} bytes")
import subprocess
r = subprocess.run(["grep", "-c", "strip_asr_hallucinations", SRC], capture_output=True, text=True)
print(f"strip_asr_hallucinations occurrences: {r.stdout.strip()}")
r = subprocess.run(["grep", "-c", "is_audio_silence\|vad_rms\|vad_zcr", SRC], capture_output=True, text=True)
print(f"VAD/silence leftovers (should be 0): {r.stdout.strip()}")