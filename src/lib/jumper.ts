/* eslint-disable */
// SUPERHACK: directly embedding jumper dist since gh actions give an error i don't want
// to waste more time debugging:
// `failed to resolve entry for package "@trufflehq/jumper". The package may have incorrect main/module/exports specified in its package.json`
// jumper is only in app.truffle.vip to send a message the legacy channel points iframe
// needs when logging ing so we can get rid of whenever mogul-menu is fully moved over
// to new dev platform, and is using its own iframe for channel points

const u = { METHOD_NOT_FOUND: -32601, INVALID_ORIGIN: 100, DEFAULT: -1 },
  h = {};
h[u.METHOD_NOT_FOUND] = "Method not found";
h[u.INVALID_ORIGIN] = "Invalid origin";
h[u.DEFAULT] = "Error";
const E = 3e3,
  k = function () {
    let s = null,
      e = null,
      t = new Promise((i, n) => ((s = i), (e = n), e));
    return (t.resolve = s), (t.reject = e), t;
  },
  c = class {
    constructor({ postMessage: e, timeout: t = E } = {}) {
      (this.postMessage = e),
        (this.timeout = t),
        (this.pendingRequests = {}),
        (this.callbackFunctions = {}),
        (this.call = this.call.bind(this)),
        (this.resolve = this.resolve.bind(this)),
        (this.resolveRPCResponse = this.resolveRPCResponse.bind(this));
    }
    call(e, t, i = {}) {
      let { timeout: n = this.timeout } = i,
        r = k(),
        o = [];
      for (const l of Array.from(t || []))
        if (typeof l == "function") {
          const R = T();
          (this.callbackFunctions[R.callbackId] = l), o.push(R);
        } else o.push(l);
      const a = v({ method: e, params: o });
      this.pendingRequests[a.id] = {
        reject: r.reject,
        resolve: r.resolve,
        isAcknowledged: !1,
      };
      try {
        this.postMessage(JSON.stringify(a), "*");
      } catch (l) {
        return r.reject(l), r;
      }
      return (
        setTimeout(() => {
          if (!this.pendingRequests[a.id].isAcknowledged)
            return r.reject(new Error("Message Timeout"));
        }, n),
        r
      );
    }
    resolve(e) {
      switch (!1) {
        case !y(e):
          return this.resolveRPCRequestAcknowledgement(e);
        case !g(e):
          return this.resolveRPCResponse(e);
        case !F(e):
          return this.resolveRPCCallbackResponse(e);
        default:
          throw new Error("Unknown response type");
      }
    }
    resolveRPCResponse(e) {
      const t = this.pendingRequests[e.id];
      if (t == null) throw new Error("Request not found");
      t.isAcknowledged = !0;
      const { result: i, error: n } = e;
      return (
        n
          ? t.reject(n.data || new Error(n.message))
          : i != null
          ? t.resolve(i)
          : t.resolve(null),
        null
      );
    }
    resolveRPCRequestAcknowledgement(e) {
      const t = this.pendingRequests[e.id];
      if (t == null) throw new Error("Request not found");
      return (t.isAcknowledged = !0), null;
    }
    resolveRPCCallbackResponse(e) {
      const t = this.callbackFunctions[e.callbackId];
      if (t == null) throw new Error("Callback not found");
      return t(...(e.params || [])), null;
    }
  };
function m({ params: s, callbackId: e }) {
  return { _browserComms: !0, callbackId: e, params: s };
}
function C({ requestId: s }) {
  return { _browserComms: !0, id: s, acknowledge: !0 };
}
function d({ requestId: s, result: e = null, rPCError: t = null }) {
  return { _browserComms: !0, id: s, result: e, error: t };
}
function w({ code: s, data: e = null }) {
  const t = h[s];
  return { _browserComms: !0, code: s, message: t, data: e };
}
function f(s) {
  return s?._browserComms;
}
function P(s) {
  return s?.id != null && s.method != null;
}
function g(s) {
  return s?.id && (s.result !== void 0 || s.error !== void 0);
}
function T() {
  return { _browserComms: !0, _browserCommsGunCallback: !0, callbackId: x() };
}
function v({ method: s, params: e }) {
  if (e == null) throw new Error("Must provide params");
  for (const t of Array.from(e))
    if (typeof t == "function")
      throw new Error("Functions are not allowed. Use RPCCallback instead.");
  return { _browserComms: !0, id: x(), method: s, params: e };
}
function y(s) {
  return s?.acknowledge === !0;
}
function F(s) {
  return s?.callbackId && s.params != null;
}
function b(s) {
  return s?._browserCommsGunCallback;
}
function x() {
  let s = new Date().getTime(),
    e =
      (typeof performance < "u" &&
        performance.now &&
        performance.now() * 1e3) ||
      0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
    let i = Math.random() * 16;
    return (
      s > 0
        ? ((i = (s + i) % 16 | 0), (s = Math.floor(s / 16)))
        : ((i = (e + i) % 16 | 0), (e = Math.floor(e / 16))),
      (t === "x" ? i : (i & 3) | 8).toString(16)
    );
  });
}
const _ = 1e4,
  I = 5e3,
  M = typeof document < "u" ? window : typeof self < "u" ? self : null,
  p = class {
    constructor(e = {}) {
      const {
        timeout: t,
        shouldConnectToServiceWorker: i,
        handshakeTimeout: n = _,
        isParentValidFn: r = () => !0,
      } = e;
      (this.handshakeTimeout = n),
        (this.isParentValidFn = r),
        (this.isListening = !1),
        (this.isNotTopWindow =
          typeof document < "u" && window.self !== window.top),
        (this.hasParent =
          globalThis?.window?.ReactNativeWebView || this.isNotTopWindow),
        this.isNotTopWindow
          ? (this.parent = globalThis?.window?.parent)
          : (this.parent =
              globalThis?.window?.ReactNativeWebView ||
              globalThis?.window?.parent),
        (this.client = new c({
          timeout: t,
          postMessage: (o, a) => {
            globalThis?.window?.ReactNativeWebView && !this.isNotTopWindow
              ? this.parent?.postMessage(o)
              : this.parent?.postMessage(o, a);
          },
        })),
        (this.waitForSw = i && S()),
        (this.registeredMethods = {
          ping: () => Object.keys(this.registeredMethods),
        }),
        (this.parentsRegisteredMethods = []),
        (this.parentHasMethod = this.parentHasMethod.bind(this)),
        (this.setParent = this.setParent.bind(this)),
        (this.listen = this.listen.bind(this)),
        (this.close = this.close.bind(this)),
        (this.call = this.call.bind(this)),
        (this.onRequest = this.onRequest.bind(this)),
        (this.onMessage = this.onMessage.bind(this)),
        (this.on = this.on.bind(this));
    }
    setParent(e) {
      (this.parent = e), (this.hasParent = !0);
    }
    listen() {
      (this.isListening = !0),
        M.addEventListener?.("message", this.onMessage, !0),
        (this.waitForParentPing =
          this.hasParent &&
          this.client
            .call("ping", null, { timeout: this.handshakeTimeout })
            .then((e) => {
              this.parentsRegisteredMethods =
                this.parentsRegisteredMethods.concat(e);
            })
            .catch(() => null)),
        (this.waitForSwPing =
          this.waitForSw &&
          this.waitForSw
            .then(() =>
              this.sw?.call("ping", null, { timeout: this.handshakeTimeout })
            )
            .then((e) => {
              this.parentsRegisteredMethods =
                this.parentsRegisteredMethods.concat(e);
            })
            .catch(() => null));
    }
    close() {
      return (
        (this.isListening = !0),
        M?.removeEventListener("message", this.onMessage)
      );
    }
    parentHasMethod(e) {
      return this.parentsRegisteredMethods.indexOf(e) !== -1;
    }
    async call(e, ...t) {
      if (!this.isListening)
        return new Promise((n, r) =>
          r(new Error("Must call listen() before call()"))
        );
      const i = (n, r) => {
        const o = this.registeredMethods[n];
        if (!o) throw new Error("Method not found: " + n);
        return o(...r);
      };
      if (
        (this.waitForSw && (await this.waitForSw), !this.hasParent && !this.sw)
      )
        return i(e, t);
      {
        let n = null;
        if (
          (this.waitForParentPing && (await this.waitForParentPing),
          this.waitForSwPing && (await this.waitForSwPing),
          this.parentHasMethod(e))
        ) {
          let r;
          try {
            if (!this.hasParent) throw new Error("No parent");
            r = await this.client.call(e, t);
          } catch (o) {
            try {
              if (((n = o), this.sw))
                try {
                  r = await this.sw.call(e, t);
                } catch {
                  return i(e, t);
                }
              else return i(e, t);
            } catch (a) {
              throw a.message === "Method not found" && n ? n : a;
            }
          }
          if (e === "ping") {
            const o = i(e, t);
            r = (r || []).concat(o);
          }
          return r;
        } else return i(e, t);
      }
    }
    async onRequest(e, t, i) {
      const n = [];
      for (const r of Array.from(t.params || []))
        b(r)
          ? ((o) =>
              n.push((...a) => e(m({ params: a, callbackId: o.callbackId }))))(
              r
            )
          : n.push(r);
      e(C({ requestId: t.id }));
      try {
        const r = await this.call(t.method, ...Array.from(n), { e: i });
        return e(d({ requestId: t.id, result: r }));
      } catch (r) {
        return e(
          d({ requestId: t.id, rPCError: w({ code: u.DEFAULT, data: r }) })
        );
      }
    }
    onMessage(e, { isServiceWorker: t, reply: i } = {}) {
      try {
        const n = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
        if (!f(n)) return;
        if (
          ((i =
            i ||
            function (r) {
              return typeof document < "u" && window !== null
                ? e.source?.postMessage(JSON.stringify(r), "*")
                : e.ports[0].postMessage(JSON.stringify(r));
            }),
          P(n))
        )
          return this.onRequest(i, n, e);
        if (f(n)) {
          let r;
          if (this.isParentValidFn(e.origin))
            return (r = t ? this.sw : this.client), r.resolve(n);
          if (g(n))
            return (
              (r = t ? this.sw : this.client),
              r.resolve(
                d({ requestId: n.id, rPCError: w({ code: u.INVALID_ORIGIN }) })
              )
            );
          throw new Error("Invalid origin");
        } else throw new Error("Unknown RPCEntity type");
      } catch {}
    }
    on(e, t) {
      this.registeredMethods[e] = t;
    }
  },
  O = p;
function S() {
  return new Promise((s, e) => {
    const t = setTimeout(s, I);
    return navigator?.serviceWorker?.ready
      .catch(function () {
        return console.log("caught sw error"), null;
      })
      .then((i) => {
        const n = i?.active;
        return (
          n &&
            (this.sw = new c({
              timeout: this.timeout,
              postMessage: (r, o) => {
                const a = new MessageChannel();
                if (a)
                  return (
                    (a.port1.onmessage = (l) =>
                      this.onMessage(l, { isServiceWorker: !0 })),
                    n.postMessage(r, [a.port2])
                  );
              },
            })),
          clearTimeout(t),
          s()
        );
      });
  });
}
const Jumper = O;
const LOCAL_STORAGE_PREFIX = "truffle";
const PLATFORMS = {
  APP: "app",
  WEB: "web",
};
const isSsr =
  typeof document === "undefined" ||
  globalThis?.process?.release?.name === "node" ||
  globalThis?.Deno;
class JumperInstance {
  isChrome() {
    return globalThis?.navigator?.userAgent.match(/chrome/i);
  }
  networkInformationOnOnline(fn) {
    return window.addEventListener("online", fn);
  }
  networkInformationOnOffline(fn) {
    return window.addEventListener("offline", fn);
  }
  constructor() {
    this.call = (...args) => {
      if (isSsr) {
        // throw new Error 'Comms called server-side'
        return console.log("Comms called server-side");
      }
      return this.jumper.call(...args).catch((err) => {
        // if we don't catch, zorium freaks out if a jumper call is in state
        // (infinite errors on page load/route)
        // FIXME: re-enable
        // console.log('missing jumper call', args)
        if (!err.message?.startsWith?.("Method not found")) {
          console.log(err);
        }
        return null;
      });
    };
    this.callWithError = (...args) => {
      if (isSsr) {
        // throw new Error 'Comms called server-side'
        return console.log("Comms called server-side");
      }
      return this.jumper.call(...Array.from(args || []));
    };
    this.listen = () => {
      if (isSsr) {
        throw new Error("Comms called server-side");
      }
      this.jumper.listen();
      this.jumper.on("auth.getStatus", this.authGetStatus);
      this.jumper.on("env.getPlatform", this.getPlatform);
      // fallbacks
      this.jumper.on("app.onResume", this.appOnResume);
      this.jumper.on(
        "networkInformation.onOnline",
        this.networkInformationOnOnline
      );
      this.jumper.on(
        "networkInformation.onOffline",
        this.networkInformationOnOffline
      );
      this.jumper.on(
        "networkInformation.onOnline",
        this.networkInformationOnOnline
      );
      this.jumper.on("storage.get", this.storageGet);
      this.jumper.on("storage.set", this.storageSet);
      return this.jumper.on("browser.openWindow", ({ url, target, options }) =>
        window?.open(url, target, options)
      );
    };
    /*
  @typedef AuthStatus
  @property {String} accessToken
  @property {String} userId
  */ /*
  @returns {Promise<AuthStatus>}
  */ this.authGetStatus = async () => {
      const user = await this.model.user.getMe().take(1).toPromise();
      return {
        // Temporary
        accessToken: user.id,
        userId: user.id,
      };
    };
    this.getPlatform = (param) => {
      // const { userAgent } = navigator
      switch (false) {
        // case !Environment.isNativeApp({ userAgent }):
        //   return this.PLATFORMS.APP
        default:
          return PLATFORMS.WEB;
      }
    };
    this.appOnResume = (callback) => {
      if (this.appResumeHandler) {
        window.removeEventListener("visibilitychange", this.appResumeHandler);
      }
      this.appResumeHandler = function () {
        if (!document.hidden) {
          return callback();
        }
      };
      return window.addEventListener("visibilitychange", this.appResumeHandler);
    };
    this.storageGet = ({ key }) => {
      return window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}:${key}`);
    };
    this.storageSet = ({ key, value }) => {
      window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}:${key}`, value);
    };
    if (!isSsr) {
      // TODO: setup service worker so it actually responds and doesn't timeout
      // when you're enabling this, test that it doesn't slow down the
      // first browsercomms call in browser extension
      const shouldConnectToServiceWorker = false;
      // const shouldConnectToServiceWorker = navigator.serviceWorker &&
      //   typeof document !== 'undefined' &&
      //   window.location.protocol !== 'http:'
      this.jumper = new Jumper({
        shouldConnectToServiceWorker,
      });
      this.appResumeHandler = null;
    }
  }
}
const jumper = new JumperInstance() as any;
if (!isSsr) {
  // HACK: only want 1 jumper listening even if this file somehow ends up
  // loaded by browser/bundle multiple times.
  // TODO: restructure jumper to automatically listen and only do so once per layer
  window._isTruffleJumperListening = true;
  jumper.listen();
}
export default jumper;
