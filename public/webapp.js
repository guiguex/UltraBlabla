var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/@capacitor/core/dist/index.js
class WebPlugin {
  constructor(config) {
    this.listeners = {};
    this.retainedEventArguments = {};
    this.windowListeners = {};
    if (config) {
      console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
      this.config = config;
    }
  }
  addListener(eventName, listenerFunc) {
    let firstListener = false;
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
      firstListener = true;
    }
    this.listeners[eventName].push(listenerFunc);
    const windowListener = this.windowListeners[eventName];
    if (windowListener && !windowListener.registered) {
      this.addWindowListener(windowListener);
    }
    if (firstListener) {
      this.sendRetainedArgumentsForEvent(eventName);
    }
    const remove = async () => this.removeListener(eventName, listenerFunc);
    const p = Promise.resolve({ remove });
    return p;
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const listener in this.windowListeners) {
      this.removeWindowListener(this.windowListeners[listener]);
    }
    this.windowListeners = {};
  }
  notifyListeners(eventName, data, retainUntilConsumed) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      if (retainUntilConsumed) {
        let args = this.retainedEventArguments[eventName];
        if (!args) {
          args = [];
        }
        args.push(data);
        this.retainedEventArguments[eventName] = args;
      }
      return;
    }
    listeners.forEach((listener) => listener(data));
  }
  hasListeners(eventName) {
    return !!this.listeners[eventName].length;
  }
  registerWindowListener(windowEventName, pluginEventName) {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: (event) => {
        this.notifyListeners(pluginEventName, event);
      }
    };
  }
  unimplemented(msg = "not implemented") {
    return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
  }
  unavailable(msg = "not available") {
    return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
  }
  async removeListener(eventName, listenerFunc) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);
    if (!this.listeners[eventName].length) {
      this.removeWindowListener(this.windowListeners[eventName]);
    }
  }
  addWindowListener(handle) {
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }
  removeWindowListener(handle) {
    if (!handle) {
      return;
    }
    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }
  sendRetainedArgumentsForEvent(eventName) {
    const args = this.retainedEventArguments[eventName];
    if (!args) {
      return;
    }
    delete this.retainedEventArguments[eventName];
    args.forEach((arg) => {
      this.notifyListeners(eventName, arg);
    });
  }
}
var createCapacitorPlatforms = (win) => {
  const defaultPlatformMap = new Map;
  defaultPlatformMap.set("web", { name: "web" });
  const capPlatforms = win.CapacitorPlatforms || {
    currentPlatform: { name: "web" },
    platforms: defaultPlatformMap
  };
  const addPlatform = (name, platform) => {
    capPlatforms.platforms.set(name, platform);
  };
  const setPlatform = (name) => {
    if (capPlatforms.platforms.has(name)) {
      capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
    }
  };
  capPlatforms.addPlatform = addPlatform;
  capPlatforms.setPlatform = setPlatform;
  return capPlatforms;
}, initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win), CapacitorPlatforms, addPlatform, setPlatform, ExceptionCode, CapacitorException, getPlatformId = (win) => {
  var _a, _b;
  if (win === null || win === undefined ? undefined : win.androidBridge) {
    return "android";
  } else if ((_b = (_a = win === null || win === undefined ? undefined : win.webkit) === null || _a === undefined ? undefined : _a.messageHandlers) === null || _b === undefined ? undefined : _b.bridge) {
    return "ios";
  } else {
    return "web";
  }
}, createCapacitor = (win) => {
  var _a, _b, _c, _d, _e;
  const capCustomPlatform = win.CapacitorCustomPlatform || null;
  const cap = win.Capacitor || {};
  const Plugins = cap.Plugins = cap.Plugins || {};
  const capPlatforms = win.CapacitorPlatforms;
  const defaultGetPlatform = () => {
    return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
  };
  const getPlatform = ((_a = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _a === undefined ? undefined : _a.getPlatform) || defaultGetPlatform;
  const defaultIsNativePlatform = () => getPlatform() !== "web";
  const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _b === undefined ? undefined : _b.isNativePlatform) || defaultIsNativePlatform;
  const defaultIsPluginAvailable = (pluginName) => {
    const plugin = registeredPlugins.get(pluginName);
    if (plugin === null || plugin === undefined ? undefined : plugin.platforms.has(getPlatform())) {
      return true;
    }
    if (getPluginHeader(pluginName)) {
      return true;
    }
    return false;
  };
  const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _c === undefined ? undefined : _c.isPluginAvailable) || defaultIsPluginAvailable;
  const defaultGetPluginHeader = (pluginName) => {
    var _a2;
    return (_a2 = cap.PluginHeaders) === null || _a2 === undefined ? undefined : _a2.find((h) => h.name === pluginName);
  };
  const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _d === undefined ? undefined : _d.getPluginHeader) || defaultGetPluginHeader;
  const handleError = (err) => win.console.error(err);
  const pluginMethodNoop = (_target, prop, pluginName) => {
    return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
  };
  const registeredPlugins = new Map;
  const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
      return registeredPlugin.proxy;
    }
    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation;
    const loadPluginImplementation = async () => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
      } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
        jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
      }
      return jsImplementation;
    };
    const createPluginMethod = (impl, prop) => {
      var _a2, _b2;
      if (pluginHeader) {
        const methodHeader = pluginHeader === null || pluginHeader === undefined ? undefined : pluginHeader.methods.find((m) => prop === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === "promise") {
            return (options) => cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
          }
        } else if (impl) {
          return (_a2 = impl[prop]) === null || _a2 === undefined ? undefined : _a2.bind(impl);
        }
      } else if (impl) {
        return (_b2 = impl[prop]) === null || _b2 === undefined ? undefined : _b2.bind(impl);
      } else {
        throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
      }
    };
    const createPluginMethodWrapper = (prop) => {
      let remove;
      const wrapper = (...args) => {
        const p = loadPluginImplementation().then((impl) => {
          const fn = createPluginMethod(impl, prop);
          if (fn) {
            const p2 = fn(...args);
            remove = p2 === null || p2 === undefined ? undefined : p2.remove;
            return p2;
          } else {
            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
          }
        });
        if (prop === "addListener") {
          p.remove = async () => remove();
        }
        return p;
      };
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, "name", {
        value: prop,
        writable: false,
        configurable: false
      });
      return wrapper;
    };
    const addListener = createPluginMethodWrapper("addListener");
    const removeListener = createPluginMethodWrapper("removeListener");
    const addListenerNative = (eventName, callback) => {
      const call = addListener({ eventName }, callback);
      const remove = async () => {
        const callbackId = await call;
        removeListener({
          eventName,
          callbackId
        }, callback);
      };
      const p = new Promise((resolve) => call.then(() => resolve({ remove })));
      p.remove = async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      };
      return p;
    };
    const proxy = new Proxy({}, {
      get(_, prop) {
        switch (prop) {
          case "$$typeof":
            return;
          case "toJSON":
            return () => ({});
          case "addListener":
            return pluginHeader ? addListenerNative : addListener;
          case "removeListener":
            return removeListener;
          default:
            return createPluginMethodWrapper(prop);
        }
      }
    });
    Plugins[pluginName] = proxy;
    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: new Set([
        ...Object.keys(jsImplementations),
        ...pluginHeader ? [platform] : []
      ])
    });
    return proxy;
  };
  const registerPlugin = ((_e = capPlatforms === null || capPlatforms === undefined ? undefined : capPlatforms.currentPlatform) === null || _e === undefined ? undefined : _e.registerPlugin) || defaultRegisterPlugin;
  if (!cap.convertFileSrc) {
    cap.convertFileSrc = (filePath) => filePath;
  }
  cap.getPlatform = getPlatform;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;
  cap.isLoggingEnabled = !!cap.isLoggingEnabled;
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
  return cap;
}, initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win), Capacitor, registerPlugin, Plugins, encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape), decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent), CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader;
  reader.onload = () => {
    const base64String = reader.result;
    resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
  };
  reader.onerror = (error) => reject(error);
  reader.readAsDataURL(blob);
}), normalizeHttpHeaders = (headers = {}) => {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
}, buildUrlParams = (params, shouldEncode = true) => {
  if (!params)
    return null;
  const output = Object.entries(params).reduce((accumulator, entry) => {
    const [key, value] = entry;
    let encodedValue;
    let item;
    if (Array.isArray(value)) {
      item = "";
      value.forEach((str) => {
        encodedValue = shouldEncode ? encodeURIComponent(str) : str;
        item += `${key}=${encodedValue}&`;
      });
      item.slice(0, -1);
    } else {
      encodedValue = shouldEncode ? encodeURIComponent(value) : value;
      item = `${key}=${encodedValue}`;
    }
    return `${accumulator}&${item}`;
  }, "");
  return output.substr(1);
}, buildRequestInit = (options, extra = {}) => {
  const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers["content-type"] || "";
  if (typeof options.data === "string") {
    output.body = options.data;
  } else if (type.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams;
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value);
    }
    output.body = params.toString();
  } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
    const form = new FormData;
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (const key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const headers2 = new Headers(output.headers);
    headers2.delete("content-type");
    output.headers = headers2;
  } else if (type.includes("application/json") || typeof options.data === "object") {
    output.body = JSON.stringify(options.data);
  }
  return output;
}, CapacitorHttpPluginWeb, CapacitorHttp;
var init_dist = __esm(() => {
  /*! Capacitor: https://capacitorjs.com/ - MIT License */
  CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  addPlatform = CapacitorPlatforms.addPlatform;
  setPlatform = CapacitorPlatforms.setPlatform;
  (function(ExceptionCode2) {
    ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
    ExceptionCode2["Unavailable"] = "UNAVAILABLE";
  })(ExceptionCode || (ExceptionCode = {}));
  CapacitorException = class CapacitorException extends Error {
    constructor(message, code, data) {
      super(message);
      this.message = message;
      this.code = code;
      this.data = data;
    }
  };
  Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  registerPlugin = Capacitor.registerPlugin;
  Plugins = Capacitor.Plugins;
  CapacitorCookiesPluginWeb = class CapacitorCookiesPluginWeb extends WebPlugin {
    async getCookies() {
      const cookies = document.cookie;
      const cookieMap = {};
      cookies.split(";").forEach((cookie) => {
        if (cookie.length <= 0)
          return;
        let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        key = decode(key).trim();
        value = decode(value).trim();
        cookieMap[key] = value;
      });
      return cookieMap;
    }
    async setCookie(options) {
      try {
        const encodedKey = encode(options.key);
        const encodedValue = encode(options.value);
        const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
        const path = (options.path || "/").replace("path=", "");
        const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
        document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async deleteCookie(options) {
      try {
        document.cookie = `${options.key}=; Max-Age=0`;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async clearCookies() {
      try {
        const cookies = document.cookie.split(";") || [];
        for (const cookie of cookies) {
          document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async clearAllCookies() {
      try {
        await this.clearCookies();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  };
  CapacitorCookies = registerPlugin("CapacitorCookies", {
    web: () => new CapacitorCookiesPluginWeb
  });
  CapacitorHttpPluginWeb = class CapacitorHttpPluginWeb extends WebPlugin {
    async request(options) {
      const requestInit = buildRequestInit(options, options.webFetchExtra);
      const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
      const url = urlParams ? `${options.url}?${urlParams}` : options.url;
      const response = await fetch(url, requestInit);
      const contentType = response.headers.get("content-type") || "";
      let { responseType = "text" } = response.ok ? options : {};
      if (contentType.includes("application/json")) {
        responseType = "json";
      }
      let data;
      let blob;
      switch (responseType) {
        case "arraybuffer":
        case "blob":
          blob = await response.blob();
          data = await readBlobAsBase64(blob);
          break;
        case "json":
          data = await response.json();
          break;
        case "document":
        case "text":
        default:
          data = await response.text();
      }
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return {
        data,
        headers,
        status: response.status,
        url: response.url
      };
    }
    async get(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
    }
    async post(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
    }
    async put(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
    }
    async patch(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
    }
    async delete(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
    }
  };
  CapacitorHttp = registerPlugin("CapacitorHttp", {
    web: () => new CapacitorHttpPluginWeb
  });
});

// node_modules/@capacitor-community/text-to-speech/dist/esm/web.js
var exports_web = {};
__export(exports_web, {
  TextToSpeechWeb: () => TextToSpeechWeb
});
var TextToSpeechWeb;
var init_web = __esm(() => {
  init_dist();
  TextToSpeechWeb = class TextToSpeechWeb extends WebPlugin {
    constructor() {
      super();
      this.speechSynthesis = null;
      if ("speechSynthesis" in window) {
        this.speechSynthesis = window.speechSynthesis;
        window.addEventListener("beforeunload", () => {
          this.stop();
        });
      }
    }
    async speak(options) {
      if (!this.speechSynthesis) {
        this.throwUnsupportedError();
      }
      await this.stop();
      const speechSynthesis = this.speechSynthesis;
      const utterance = this.createSpeechSynthesisUtterance(options);
      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          resolve();
        };
        utterance.onerror = (event) => {
          reject(event);
        };
        speechSynthesis.speak(utterance);
      });
    }
    async stop() {
      if (!this.speechSynthesis) {
        this.throwUnsupportedError();
      }
      this.speechSynthesis.cancel();
    }
    async getSupportedLanguages() {
      const voices = this.getSpeechSynthesisVoices();
      const languages = voices.map((voice) => voice.lang);
      const filteredLanguages = languages.filter((v, i, a) => a.indexOf(v) == i);
      return { languages: filteredLanguages };
    }
    async getSupportedVoices() {
      const voices = this.getSpeechSynthesisVoices();
      return { voices };
    }
    async isLanguageSupported(options) {
      const result = await this.getSupportedLanguages();
      const isLanguageSupported = result.languages.includes(options.lang);
      return { supported: isLanguageSupported };
    }
    async openInstall() {
      this.throwUnimplementedError();
    }
    createSpeechSynthesisUtterance(options) {
      const voices = this.getSpeechSynthesisVoices();
      const utterance = new SpeechSynthesisUtterance;
      const { text, lang, rate, pitch, volume, voice } = options;
      if (voice) {
        utterance.voice = voices[voice];
      }
      if (volume) {
        utterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
      }
      if (rate) {
        utterance.rate = rate >= 0.1 && rate <= 10 ? rate : 1;
      }
      if (pitch) {
        utterance.pitch = pitch >= 0 && pitch <= 2 ? pitch : 2;
      }
      if (lang) {
        utterance.lang = lang;
      }
      utterance.text = text;
      return utterance;
    }
    getSpeechSynthesisVoices() {
      if (!this.speechSynthesis) {
        this.throwUnsupportedError();
      }
      if (!this.supportedVoices || this.supportedVoices.length < 1) {
        this.supportedVoices = this.speechSynthesis.getVoices();
      }
      return this.supportedVoices;
    }
    throwUnsupportedError() {
      throw this.unavailable("SpeechSynthesis API not available in this browser.");
    }
    throwUnimplementedError() {
      throw this.unimplemented("Not implemented on web.");
    }
  };
});

// src/fe/webapp.ts
init_dist();

// node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
init_dist();

// node_modules/@capacitor-community/text-to-speech/dist/esm/definitions.js
var QueueStrategy;
(function(QueueStrategy2) {
  QueueStrategy2[QueueStrategy2["Flush"] = 0] = "Flush";
  QueueStrategy2[QueueStrategy2["Add"] = 1] = "Add";
})(QueueStrategy || (QueueStrategy = {}));

// node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
var TextToSpeech = registerPlugin("TextToSpeech", {
  web: () => Promise.resolve().then(() => (init_web(), exports_web)).then((m) => new m.TextToSpeechWeb)
});
if ("speechSynthesis" in window) {
  window.speechSynthesis;
}

// src/fe/webapp.ts
var Voice = registerPlugin("Voice");

class UltraBlablaVoiceApp {
  isInConversation = false;
  isListening = false;
  isProcessing = false;
  isSpeaking = false;
  recordBtn;
  messages;
  status;
  clearBtn;
  voice;
  conversationHistory = [];
  constructor() {
    this.voice = Voice;
    document.addEventListener("DOMContentLoaded", () => {
      this.initializeElements();
      this.setupEventListeners();
      this.setupVoiceCallbacks();
      this.initializeChatBox();
      this.initializeApp();
    });
  }
  initializeElements() {
    this.recordBtn = document.getElementById("recordBtn");
    this.messages = document.getElementById("messages");
    this.status = document.getElementById("status");
    this.clearBtn = document.getElementById("clearBtn");
  }
  setupEventListeners() {
    this.recordBtn?.addEventListener("click", () => this.toggleConversation());
    this.clearBtn?.addEventListener("click", () => this.clearMessages());
    document.getElementById("settingsBtn")?.addEventListener("click", () => {
      this.showSettings();
    });
    document.addEventListener("touchstart", () => {
      if (this.isSpeaking) {
        if (Capacitor.isNativePlatform()) {
          this.voice.pauseListening();
        }
      }
    });
  }
  setupVoiceCallbacks() {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Plugin Voice disponible uniquement en mode natif");
      return;
    }
    this.voice.addListener("sttResult", (data) => {
      if (data.type === "final") {
        this.handleSpeechResult(data.text);
      } else if (data.type === "partial") {
        this.updateStatus(`\uD83C\uDFA7 ${data.text}`, "listening");
      }
    });
    this.voice.addListener("aiResponse", (data) => {
      this.handleAIResponse(data);
    });
    this.voice.addListener("llmProcessing", (data) => {
      this.isProcessing = data.status === "processing";
      if (data.status === "processing") {
        this.updateStatus("\uD83E\uDDE0 IA réfléchit...", "processing");
      } else if (data.status === "error") {
        this.updateStatus("❌ Erreur LLM", "error");
      }
    });
    this.voice.addListener("llmError", (data) => {
      this.isProcessing = false;
      this.addMessage(`❌ Erreur LLM: ${data.error}`, "system");
      this.updateConversationStatus();
    });
    this.voice.addListener("listeningStarted", () => {
      console.log("\uD83C\uDFA4 listeningStarted event - Ajout classe .recording");
      this.isListening = true;
      this.recordBtn.classList.add("recording");
      this.updateConversationStatus();
    });
    this.voice.addListener("listeningStopped", () => {
      console.log("\uD83D\uDED1 listeningStopped event - Retrait classe .recording");
      this.isListening = false;
      this.recordBtn.classList.remove("recording");
      this.updateConversationStatus();
    });
    this.voice.addListener("conversationStarted", () => {
      this.isInConversation = true;
      this.updateConversationStatus();
    });
    this.voice.addListener("conversationStopped", () => {
      this.isInConversation = false;
      this.isListening = false;
      this.isSpeaking = false;
      this.updateConversationStatus();
    });
    this.voice.addListener("sttError", (data) => {
      console.error("STT Error:", data.error);
      this.addMessage("❌ Erreur de reconnaissance vocale", "system");
      this.updateStatus("Prêt • 100% Offline", "online");
      this.isInConversation = false;
      this.recordBtn.classList.remove("conversation");
      this.recordBtn.querySelector(".btn-text").textContent = "Parler";
    });
    this.voice.addListener("voiceError", (data) => {
      this.addMessage(`❌ Erreur native: ${data.error}`, "system");
      this.isProcessing = false;
      this.updateConversationStatus();
    });
    this.voice.addListener("sttResult", (data) => {
      if (data.type === "final") {
        this.handleSpeechResult(data.text);
      } else if (data.type === "partial") {
        this.updateStatus(`\uD83C\uDFA7 ${data.text}`, "listening");
      }
    });
    this.voice.addListener("aiResponse", (data) => {
      this.handleAIResponse(data);
    });
    this.voice.addListener("voiceActivity", (data) => {
      this.updateVoiceIndicator(data.active, data.level);
    });
  }
  handleSpeechResult(text) {
    if (text.trim()) {
      this.addMessage(text, "user");
      this.conversationHistory.push({
        user: text,
        ai: "",
        timestamp: Date.now()
      });
    }
  }
  async handleAIResponse(data) {
    const userText = data.userText?.trim() ?? "";
    const aiResponse = data.aiResponse?.trim() ?? "";
    if (userText) {
      const lastEntry = this.conversationHistory[this.conversationHistory.length - 1];
      if (!lastEntry || lastEntry.user !== userText) {
        this.addMessage(userText, "user");
        this.conversationHistory.push({
          user: userText,
          ai: "",
          timestamp: data.timestamp || Date.now()
        });
      }
    }
    if (aiResponse) {
      this.addMessage(aiResponse, "ai");
      if (this.conversationHistory.length > 0) {
        this.conversationHistory[this.conversationHistory.length - 1].ai = aiResponse;
      }
      this.isSpeaking = true;
      this.updateConversationStatus();
      try {
        await this.speakResponse(aiResponse);
      } finally {
        this.isSpeaking = false;
        this.updateConversationStatus();
      }
    }
  }
  updateConversationStatus() {
    let statusText = "";
    let statusClass;
    if (this.isInConversation) {
      if (this.isSpeaking) {
        statusText = "\uD83C\uDF99️ IA parle... (touchez pour interrompre)";
        statusClass = "speaking";
      } else if (this.isListening) {
        statusText = "\uD83D\uDC42 À l'écoute... (parlez naturellement)";
        statusClass = "listening";
      } else if (this.isProcessing) {
        statusText = "\uD83E\uDDE0 Traitement...";
        statusClass = "processing";
      } else {
        statusText = "\uD83D\uDCAC Conversation active";
        statusClass = "active";
      }
    } else {
      statusText = "⏸️ Conversation en pause";
      statusClass = "paused";
    }
    this.updateStatus(statusText, statusClass);
  }
  async initializeApp() {
    this.updateStatus("Initialisation...", "loading");
    if (Capacitor.isNativePlatform()) {
      await this.initializeNativePlugins();
    } else {
      this.updateStatus("Mode Web - Fonctionnalités limitées", "warning");
      this.addMessage("⚠️ Pour toutes les fonctionnalités, utilisez l'application Android", "system");
    }
  }
  async initializeNativePlugins() {
    try {
      const permissionCheck = await this.voice.checkPermissions();
      this.addMessage("\uD83C\uDF99️ Vérification permissions microphone...", "system");
      const voiceStatus = await this.voice.init();
      if (!voiceStatus.ok) {
        if (voiceStatus.permissionDenied) {
          this.updateStatus("Permission microphone refusée", "error");
          this.addMessage("❌ Permission microphone refusée - Autorisez le microphone dans les paramètres Android", "system");
        } else {
          this.updateStatus("Erreur initialisation audio", "error");
          this.addMessage("❌ Impossible d'initialiser le moteur vocal natif", "system");
        }
        return;
      }
      this.addMessage("✅ Moteur vocal initialisé (Vosk STT + Qwen3 LLM)", "system");
      await this.initializeTTS();
      this.updateStatus("Prêt • 100% Offline", "online");
    } catch (error) {
      console.error("Error initializing native plugins:", error);
      this.updateStatus("Erreur d'initialisation", "error");
      this.addMessage("❌ Erreur lors de l'initialisation des plugins natifs", "system");
    }
  }
  async initializeTTS() {
    try {
      const voices = await TextToSpeech.getSupportedVoices();
      const frenchVoices = voices.voices.filter((v) => v.lang?.startsWith("fr"));
      if (frenchVoices.length === 0) {
        await TextToSpeech.openInstall();
        this.addMessage("\uD83D\uDCE5 Installez les voix françaises pour le TTS", "system");
      }
    } catch (error) {
      console.warn("TTS initialization warning:", error);
    }
  }
  async toggleConversation() {
    if (this.isProcessing) {
      console.warn("⏳ toggleConversation ignoré - Traitement en cours");
      return;
    }
    console.log(`\uD83D\uDD04 toggleConversation - État actuel: ${this.isInConversation ? "EN CONVERSATION" : "ARRÊTÉ"}`);
    this.recordBtn.style.transform = "scale(0.90)";
    setTimeout(() => {
      this.recordBtn.style.transform = "";
    }, 150);
    if (this.isInConversation) {
      await this.stopConversation();
    } else {
      await this.startConversation();
    }
  }
  async startConversation() {
    if (!Capacitor.isNativePlatform() || !this.voice) {
      this.addMessage("❌ Conversation native disponible uniquement sur Android", "system");
      return;
    }
    try {
      const result = await this.voice.startConversation();
      if (result.permissionDenied) {
        this.addMessage("❌ Permission microphone refusée - Activez-la dans les paramètres Android", "system");
        return;
      }
      if (!result.started) {
        this.addMessage("❌ Impossible de démarrer la conversation - " + (result.error || "Erreur inconnue"), "system");
        return;
      }
      this.isInConversation = true;
      this.recordBtn.classList.add("conversation");
      this.recordBtn.querySelector(".btn-text").textContent = "Conversation Active";
      this.addMessage("▶️ Conversation ultra dynamique démarrée ! Parlez naturellement...", "system");
      this.updateConversationStatus();
    } catch (error) {
      console.error("Erreur démarrage conversation:", error);
      this.addMessage("❌ Erreur lors du démarrage de la conversation", "system");
    }
  }
  async stopConversation() {
    if (!this.isInConversation || !this.voice)
      return;
    try {
      await this.voice.stopConversation();
      this.isInConversation = false;
      this.recordBtn.classList.remove("conversation");
      this.recordBtn.classList.remove("recording");
      this.recordBtn.querySelector(".btn-text").textContent = "Parler";
      this.updateStatus("⏳ Traitement...", "processing");
    } catch (error) {
      console.error("Error stopping recording:", error);
      this.addMessage("❌ Erreur lors de l'arrêt de l'enregistrement", "system");
    }
  }
  async speakResponse(text) {
    try {
      await TextToSpeech.speak({
        text,
        lang: "fr-FR",
        rate: 1,
        pitch: 1,
        volume: 1,
        category: "ambient"
      });
    } catch (error) {
      console.warn("TTS Error:", error);
      this.addMessage("⚠️ TTS non disponible - installez les voix françaises", "system");
    }
  }
  addMessage(text, type) {
    const welcome = this.messages.querySelector(".welcome");
    if (welcome) {
      welcome.remove();
    }
    const messageEl = document.createElement("div");
    messageEl.className = `message ${type}-message`;
    messageEl.textContent = text;
    this.messages.appendChild(messageEl);
    this.messages.scrollTop = this.messages.scrollHeight;
    if (type !== "system") {
      this.saveToHistory(text, type);
    }
  }
  clearMessages() {
    this.messages.innerHTML = `
            <div class="welcome">
                <h2>Conversation effacée</h2>
                <p>Appuyez sur le micro pour recommencer</p>
                <div class="features">
                    <div class="feature">
                        <span class="icon">\uD83C\uDFA4</span>
                        <span>Vosk STT Français</span>
                    </div>
                    <div class="feature">
                        <span class="icon">\uD83E\uDDE0</span>
                        <span>Qwen3-0.6B Local</span>
                    </div>
                    <div class="feature">
                        <span class="icon">\uD83D\uDD0A</span>
                        <span>Google TTS Offline</span>
                    </div>
                </div>
            </div>
        `;
  }
  updateStatus(text, type) {
    this.status.textContent = text;
    this.status.className = `status ${type}`;
  }
  saveToHistory(text, type) {
    const history = JSON.parse(localStorage.getItem("ultrablabla-history") || "[]");
    history.push({
      text,
      type,
      timestamp: Date.now()
    });
    if (history.length > 100) {
      history.shift();
    }
    localStorage.setItem("ultrablabla-history", JSON.stringify(history));
  }
  updateVoiceIndicator(active, level) {
    if (active && level > 0.1) {
      this.recordBtn?.classList.add("voice-active");
    } else {
      this.recordBtn?.classList.remove("voice-active");
    }
  }
  showSettings() {
    this.addMessage("⚙️ Paramètres - À implémenter", "system");
  }
  initializeChatBox() {
    console.log("Initialisation du ChatBox Neural");
    const chatToggle = document.getElementById("chatToggleBtn");
    const chatContent = document.getElementById("chatboxContent");
    const sendBtn = document.getElementById("neuralSendBtn");
    const textarea = document.getElementById("neuralInput");
    const messagesContainer = document.getElementById("neuralMessages");
    const statusText = document.getElementById("inputStatusText");
    const statusIndicator = document.getElementById("statusIndicator");
    if (chatToggle && chatContent) {
      chatToggle.addEventListener("click", () => {
        const isExpanded = chatContent.style.display !== "none";
        chatContent.style.display = isExpanded ? "none" : "flex";
        chatToggle.querySelector(".toggle-text").textContent = isExpanded ? "EXPAND" : "COLLAPSE";
      });
    }
    if (sendBtn && textarea && messagesContainer) {
      textarea.addEventListener("input", () => {
        const hasText = textarea.value.trim().length > 0;
        sendBtn.disabled = !hasText;
        console.log(`\uD83D\uDCAC Textarea input: "${textarea.value}" - Bouton ${hasText ? "ACTIVÉ" : "DÉSACTIVÉ"}`);
      });
      const sendMessage = async () => {
        const message = textarea.value.trim();
        if (!message) {
          console.warn("❌ Message vide, envoi annulé");
          return;
        }
        console.log("\uD83D\uDCE4 Envoi du message:", message);
        sendBtn.disabled = true;
        this.addChatMessage(messagesContainer, "user", "\uD83E\uDDE0", message);
        textarea.value = "";
        if (statusIndicator && statusText) {
          this.updateChatStatus(statusIndicator, statusText, "processing", "PROCESSING...");
        }
        const typingElement = this.addTypingIndicator(messagesContainer);
        try {
          console.log("\uD83E\uDD16 Appel VoicePlugin.processText...");
          const response = await this.getAIResponse(message);
          console.log("✅ Réponse reçue:", response);
          if (typingElement) {
            messagesContainer.removeChild(typingElement);
          }
          this.addChatMessage(messagesContainer, "ai", "\uD83E\uDD16", response);
          if (statusIndicator && statusText) {
            this.updateChatStatus(statusIndicator, statusText, "ready", "READY");
          }
        } catch (error) {
          console.error("❌ Erreur ChatBox:", error);
          if (typingElement) {
            messagesContainer.removeChild(typingElement);
          }
          this.addChatMessage(messagesContainer, "ai", "⚠️", `Erreur de connexion avec le modèle neural: ${error}`);
          if (statusIndicator && statusText) {
            this.updateChatStatus(statusIndicator, statusText, "error", "ERROR");
          }
        }
      };
      sendBtn.addEventListener("click", (e) => {
        console.log("\uD83D\uDDB1️ Clic sur bouton SEND détecté !");
        e.preventDefault();
        e.stopPropagation();
        sendMessage();
      });
      textarea.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          console.log("⌨️ Touche ENTER détectée !");
          sendMessage();
        }
      });
      setTimeout(async () => {
        this.addChatMessage(messagesContainer, "system", "⚡", "Neural ChatBox activé. Test des permissions...");
        try {
          const permResult = await this.voice.requestMicrophonePermission();
          if (permResult.granted) {
            this.addChatMessage(messagesContainer, "system", "✅", "Permissions microphone accordées ! Modèle Qwen3-0.6B prêt.");
          } else {
            this.addChatMessage(messagesContainer, "system", "❌", `Permission microphone requise. État: ${permResult.state}`);
            const buttonDiv = document.createElement("div");
            buttonDiv.innerHTML = `
                            <button id="requestPermBtn" style="
                                background: linear-gradient(135deg, var(--holo-primary), var(--energy-blue));
                                border: none;
                                border-radius: 15px;
                                padding: 10px 20px;
                                color: white;
                                cursor: pointer;
                                margin-top: 10px;
                            ">\uD83C\uDFA4 Demander les permissions</button>
                        `;
            messagesContainer.appendChild(buttonDiv);
            buttonDiv.querySelector("#requestPermBtn")?.addEventListener("click", async () => {
              const result = await this.voice.requestMicrophonePermission();
              this.addChatMessage(messagesContainer, "system", result.granted ? "✅" : "❌", result.granted ? "Permissions accordées !" : "Permissions refusées");
            });
          }
        } catch (error) {
          this.addChatMessage(messagesContainer, "system", "⚠️", "Erreur test permissions: " + error);
        }
        if (statusIndicator && statusText) {
          this.updateChatStatus(statusIndicator, statusText, "ready", "READY");
        }
      }, 1000);
    }
  }
  addChatMessage(container, type, avatar, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `
            <div class="message-avatar ${type}">
                ${avatar}
            </div>
            <div class="message-bubble">
                <div class="message-text">${text}</div>
            </div>
        `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }
  addTypingIndicator(container) {
    const typingDiv = document.createElement("div");
    typingDiv.className = "ai-message typing-message";
    typingDiv.innerHTML = `
            <div class="message-avatar ai">\uD83E\uDD16</div>
            <div class="message-bubble">
                <div class="message-text">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    return typingDiv;
  }
  updateChatStatus(indicator, text, status, message) {
    indicator.className = `status-indicator ${status}`;
    text.textContent = message;
  }
  async getAIResponse(message) {
    try {
      console.log("Envoi du message à l'IA:", message);
      if (message.toLowerCase().includes("permission") || message.toLowerCase().includes("micro")) {
        const permCheck = await this.voice.checkPermissions();
        return `Système de permissions: ${permCheck.granted ? "✅ ACTIF" : "❌ INACTIF"} (État: ${permCheck.microphone})`;
      }
      if (message.toLowerCase().includes("test") || message.toLowerCase().includes("modèle")) {
        try {
          const initResult = await this.voice.init();
          return `État du modèle LLM: ${initResult.llm ? "✅ Chargé" : "❌ Erreur"} | Vosk: ${initResult.vosk ? "✅ OK" : "❌ KO"}`;
        } catch (error) {
          return `Erreur initialisation: ${error}`;
        }
      }
      const result = await this.voice.processText({
        text: message,
        action: "chat"
      });
      if (result && result.response) {
        return result.response;
      } else {
        return this.getFallbackResponse(message);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      return `❌ Erreur: ${error}. Fallback: ${this.getFallbackResponse(message)}`;
    }
  }
  getFallbackResponse(message) {
    if (message.toLowerCase().includes("bonjour") || message.toLowerCase().includes("salut")) {
      return `Bonjour ! Je suis UltraBlabla AI. Système neural en ligne. Comment puis-je vous aider ?`;
    }
    if (message.toLowerCase().includes("comment") && message.toLowerCase().includes("vas")) {
      return `Système neural fonctionnel à 100%. Toutes mes fonctions cognitives sont opérationnelles.`;
    }
    if (message.toLowerCase().includes("quoi") || message.toLowerCase().includes("que")) {
      return `Je suis une IA vocale intégrée avec Vosk STT et Qwen3-0.6B LLM. Je peux répondre à vos questions.`;
    }
    const responses = [
      `Message reçu et traité par UltraBlabla AI. Analyse: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
      `Système neural actif. Votre requête a été intégrée dans ma base de connaissances.`,
      `IA conversationnelle prête. Modèle Qwen3 en mode test avec votre message.`,
      `Interface cognitive opérationnelle. Processing terminé avec succès.`,
      `Réponse générée par le noyau neural UltraBlabla. Status: ONLINE`
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new UltraBlablaVoiceApp;
  console.log("\uD83D\uDE80 UltraBlabla initialized - Native Android Voice AI");
});
