#!/usr/bin/env bun
/**
 * Script de vérification de l'architecture Ultra-Dynamique
 * Vérifie que tous les composants sont en place pour la compilation NDK
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Vérification UltraBlabla Voice AI Ultra-Dynamique\n');

interface CheckResult {
    name: string;
    status: 'OK' | 'WARN' | 'MISSING';
    details?: string;
}

const checks: CheckResult[] = [];

// Vérification des fichiers core
function checkFile(path: string, name: string): CheckResult {
    if (existsSync(path)) {
        return { name, status: 'OK' };
    } else {
        return { name, status: 'MISSING', details: `File not found: ${path}` };
    }
}

// Vérification du contenu d'un fichier
function checkFileContent(path: string, name: string, searchPattern: string): CheckResult {
    if (!existsSync(path)) {
        return { name, status: 'MISSING', details: `File not found: ${path}` };
    }
    
    try {
        const content = readFileSync(path, 'utf-8');
        if (content.includes(searchPattern)) {
            return { name, status: 'OK' };
        } else {
            return { name, status: 'WARN', details: `Pattern "${searchPattern}" not found` };
        }
    } catch (error) {
        return { name, status: 'MISSING', details: `Error reading file: ${error}` };
    }
}

console.log('📱 Android Native Architecture:');
checks.push(checkFile('android/app/build.gradle', 'Android Build Config'));
checks.push(checkFileContent('android/app/build.gradle', 'NDK Configuration', 'android.ndkVersion'));
checks.push(checkFile('android/app/src/main/java/com/ultrablabla/app/LlamaNative.java', 'LlamaNative JNI'));

console.log('🧠 C++ JNI Implementation:');
checks.push(checkFile('android/app/src/main/cpp/ultrablabla_llama_jni.cpp', 'JNI Implementation'));
checks.push(checkFile('android/app/src/main/cpp/CMakeLists.txt', 'CMake Build System'));

console.log('🎨 Interface Ultra-Moderne 2030:');
checks.push(checkFile('src/fe/webapp.ts', 'TypeScript Interface'));
checks.push(checkFileContent('src/fe/webapp.ts', 'Ultra-Dynamic Conversation', 'toggleConversation'));
checks.push(checkFile('public/style.css', 'Holographic Styles'));
checks.push(checkFileContent('public/style.css', 'Conversation Styles', 'speaking-pulse'));

console.log('📦 Build System:');
checks.push(checkFile('package.json', 'Package Configuration'));
checks.push(checkFile('capacitor.config.ts', 'Capacitor Config'));
checks.push(checkFile('public/webapp.js', 'Compiled Frontend'));

console.log('📄 Asset Directories:');
checks.push(checkFile('android/app/src/main/assets', 'Assets Directory'));

// Affichage des résultats
console.log('\n📊 Résultats de vérification:\n');

let okCount = 0;
let warnCount = 0;
let missingCount = 0;

for (const check of checks) {
    const icon = check.status === 'OK' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}`);
    
    if (check.details) {
        console.log(`   ${check.details}`);
    }
    
    if (check.status === 'OK') okCount++;
    else if (check.status === 'WARN') warnCount++;
    else missingCount++;
}

console.log(`\n📈 Résumé: ${okCount} OK, ${warnCount} WARNINGS, ${missingCount} MISSING\n`);

// Vérifications additionnelles
console.log('🔍 Vérifications additionnelles:\n');

// Vérifier les variables d'environnement Java
if (process.env.JAVA_HOME) {
    console.log('✅ JAVA_HOME défini:', process.env.JAVA_HOME);
} else {
    console.log('⚠️ JAVA_HOME non défini (requis pour compilation Android)');
    console.log('   Téléchargez JDK depuis: https://adoptium.net/');
}

// Instructions suivantes
console.log('\n🎯 Étapes suivantes:\n');

if (missingCount > 0) {
    console.log('❌ Des fichiers sont manquants. Vérifiez l\'installation.');
} else if (warnCount > 0) {
    console.log('⚠️ Configuration incomplète. Vérifiez les warnings.');
} else {
    console.log('✅ Architecture Ultra-Dynamique prête !');
    console.log('');
    console.log('🚀 Commandes de déploiement:');
    console.log('   bun run build           # Compile TypeScript');
    console.log('   bun run android:sync    # Sync Capacitor');
    console.log('   bun run android:build   # Compile APK NDK');
    console.log('');
    console.log('📱 Pour tester:');
    console.log('   - Installez les modèles IA dans assets/');
    console.log('   - Configurez JAVA_HOME si nécessaire');
    console.log('   - Lancez la compilation Android complète');
}

console.log('\n🎙️ UltraBlabla Voice AI Ultra-Dynamique • Ready for 2030! 🚀');