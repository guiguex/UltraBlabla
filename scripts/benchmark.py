import urllib.request
import json
import time
import subprocess
import os
import wave
import statistics

ASR_URL = 'http://localhost:41238/v1/audio/transcriptions'
TTS_URL = 'http://localhost:41237/v1/audio/speech'
MODEL_NAME = 'local/qwen2-audio:7b'

print('==================================================')
print('   ULTRABLABLA VOICE STACK BENCHMARK SUITE       ')
print('==================================================')

# 1. GPU
try:
    smi = subprocess.check_output(['nvidia-smi', '--query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu', '--format=csv,noheader,nounits'], text=True)
    p = [x.strip() for x in smi.strip().split(',')]
    print(f"\n[GPU] {p[0]} | VRAM: {p[2]}MB used / {p[1]}MB total ({p[3]}MB free) | Temp: {p[4]}C | Util: {p[5]}%")
except Exception as e:
    print(f"[GPU Error] {e}")

# 2. ASR
print('\n--- 1. BENCHMARK ASR (qwen-asr:cuda on port 41238) ---')
audio_path = '/home/john/qwen3-asr.cpp/audio.wav'
with wave.open(audio_path, 'rb') as w:
    duration = w.getnframes() / w.getframerate()
    sr = w.getframerate()
print(f"Test audio: {audio_path} ({duration:.2f}s, {sr}Hz)")

asr_lats = []
for i in range(5):
    boundary = '----Boundary123'
    with open(audio_path, 'rb') as f:
        data = f.read()
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode('latin1') + data + (f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nqwen3-asr\r\n--{boundary}--\r\n').encode('latin1')
    req = urllib.request.Request(ASR_URL, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}, data=body)
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.loads(r.read().decode('utf-8'))
    t1 = time.perf_counter()
    ms = (t1 - t0) * 1000
    asr_lats.append(ms)
    txt = res.get('text', '')
    print(f"  Run {i+1}: {ms:.2f} ms | Text: \"{txt.strip()}\"")

avg_asr = statistics.mean(asr_lats[1:])
rtf_asr = (avg_asr / 1000) / duration
print(f"  => ASR Avg Latency: {avg_asr:.2f} ms | RTF: {rtf_asr:.4f} ({duration/(avg_asr/1000):.1f}x faster than real-time)")

# 3. TTS
print('\n--- 2. BENCHMARK TTS (qwen-tts:cuda on port 41237) ---')
sentences = [
    ('Short (6w)', 'Bonjour, comment puis-je vous aider ?'),
    ('Medium (15w)', 'UltraBlabla est un systeme vocal intelligent et ultra rapide pour dialoguer naturellement.'),
    ('Long (30w)', 'Ce systeme vocal integre la transcription automatique de la parole, un modele de langage avance et une synthese vocale ultra reactive en temps reel.')
]

for label, text in sentences:
    tts_lats = []
    pcm_lens = []
    for i in range(3):
        payload = json.dumps({'input': text, 'voice': 'guillaume', 'response_format': 'pcm'}).encode('utf-8')
        req = urllib.request.Request(TTS_URL, headers={'Content-Type': 'application/json'}, data=payload)
        t0 = time.perf_counter()
        with urllib.request.urlopen(req, timeout=30) as r:
            pcm = r.read()
        t1 = time.perf_counter()
        ms = (t1 - t0) * 1000
        tts_lats.append(ms)
        pcm_lens.append(len(pcm))
    avg_tts = statistics.mean(tts_lats)
    dur = statistics.mean(pcm_lens) / (24000 * 2)
    rtf_tts = (avg_tts / 1000) / dur
    print(f"  {label}: {avg_tts:.2f} ms | Audio: {dur:.2f}s | RTF: {rtf_tts:.4f} ({dur/(avg_tts/1000):.1f}x real-time)")

# 4. DMR
print('\n--- 3. BENCHMARK DMR (llama.cpp CUDA on Docker Model Runner) ---')
prompts = [
    ('Classifier Intent', 'Classifie l intention en 2 mots: Je veux reserver un taxi pour l aeroport.'),
    ('Conversational Agent', 'Reponds en 1 phrase courte orale: Pourquoi preferer une IA vocale locale ?')
]

for label, prompt in prompts:
    payload = json.dumps({
        'model': MODEL_NAME,
        'messages': [{'role': 'system', 'content': 'Tu es UltraBlabla, assistant vocal direct et concis.'}, {'role': 'user', 'content': prompt}],
        'max_tokens': 50
    })
    cmd = ['docker', 'run', '--rm', 'curlimages/curl', 'curl', '-s', '-X', 'POST', 'http://model-runner.docker.internal/engines/v1/chat/completions', '-H', 'Content-Type: application/json', '-d', payload]
    t0 = time.perf_counter()
    res = subprocess.run(cmd, capture_output=True, text=True)
    t1 = time.perf_counter()
    d = json.loads(res.stdout)
    timings = d.get('timings', {})
    reply = d['choices'][0]['message']['content'].strip().replace('\n', ' ')
    pred_s = timings.get('predicted_per_second', 0)
    prompt_s = timings.get('prompt_per_second', 0)
    print(f"  {label}: Total Latency: {(t1-t0)*1000:.2f} ms | Gen Speed: {pred_s:.2f} tok/s | Prompt Speed: {prompt_s:.2f} tok/s")
    print(f"    Reply: \"{reply}\"")

# 5. Full Loop E2E
print('\n--- 4. FULL CONVERSATIONAL TURN (ASR -> LLM -> TTS) ---')
t_start = time.perf_counter()

# ASR
t0 = time.perf_counter()
boundary = '----Boundary123'
with open(audio_path, 'rb') as f:
    data = f.read()
body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode('latin1') + data + (f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nqwen3-asr\r\n--{boundary}--\r\n').encode('latin1')
req = urllib.request.Request(ASR_URL, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}, data=body)
with urllib.request.urlopen(req, timeout=30) as r:
    user_txt = json.loads(r.read().decode('utf-8')).get('text', '')
t_asr = (time.perf_counter() - t0) * 1000

# LLM
t0 = time.perf_counter()
payload = json.dumps({
    'model': MODEL_NAME,
    'messages': [{'role': 'system', 'content': 'Tu es UltraBlabla. Reponds en francais oral, 1 phrase tres courte (moins de 10 mots).'}, {'role': 'user', 'content': user_txt}],
    'max_tokens': 25
})
cmd = ['docker', 'run', '--rm', 'curlimages/curl', 'curl', '-s', '-X', 'POST', 'http://model-runner.docker.internal/engines/v1/chat/completions', '-H', 'Content-Type: application/json', '-d', payload]
res = subprocess.run(cmd, capture_output=True, text=True)
bot_txt = json.loads(res.stdout)['choices'][0]['message']['content'].strip()
t_llm = (time.perf_counter() - t0) * 1000

# TTS
t0 = time.perf_counter()
payload = json.dumps({'input': bot_txt, 'voice': 'guillaume', 'response_format': 'pcm'}).encode('utf-8')
req = urllib.request.Request(TTS_URL, headers={'Content-Type': 'application/json'}, data=payload)
with urllib.request.urlopen(req, timeout=30) as r:
    audio_out = r.read()
t_tts = (time.perf_counter() - t0) * 1000

t_total = (time.perf_counter() - t_start) * 1000
print(f"  FULL E2E Turnaround : {t_total:.2f} ms")
print(f"    - ASR  Latency: {t_asr:.2f} ms")
print(f"    - LLM  Latency: {t_llm:.2f} ms")
print(f"    - TTS  Latency: {t_tts:.2f} ms")
print(f"    User heard : \"{user_txt.strip()}\"")
print(f"    Bot spoke  : \"{bot_txt.strip()}\" ({len(audio_out)/(24000*2):.2f}s audio)")
print('==================================================\n')
