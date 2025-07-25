/*
 yt-player. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (a) {
  var b = 0;
  return function () {
    return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (a) {
  return { next: $jscomp.arrayIteratorImpl(a) };
};
$jscomp.makeIterator = function (a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : $jscomp.arrayIterator(a);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.objectCreate =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.create
    ? Object.create
    : function (a) {
        var b = function () {};
        b.prototype = a;
        return new b();
      };
$jscomp.underscoreProtoCanBeSet = function () {
  var a = { a: !0 },
    b = {};
  try {
    return (b.__proto__ = a), b.a;
  } catch (c) {}
  return !1;
};
$jscomp.setPrototypeOf =
  "function" == typeof Object.setPrototypeOf
    ? Object.setPrototypeOf
    : $jscomp.underscoreProtoCanBeSet()
      ? function (a, b) {
          a.__proto__ = b;
          if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
          return a;
        }
      : null;
$jscomp.inherits = function (a, b) {
  a.prototype = $jscomp.objectCreate(b.prototype);
  a.prototype.constructor = a;
  if ($jscomp.setPrototypeOf) {
    var c = $jscomp.setPrototypeOf;
    c(a, b);
  } else
    for (c in b)
      if ("prototype" != c)
        if (Object.defineProperties) {
          var d = Object.getOwnPropertyDescriptor(b, c);
          d && Object.defineProperty(a, c, d);
        } else a[c] = b[c];
  a.superClass_ = b.prototype;
};
$jscomp.getGlobal = function (a) {
  return "undefined" != typeof window && window === a
    ? a
    : "undefined" != typeof global && null != global
      ? global
      : a;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, c) {
        a != Array.prototype && a != Object.prototype && (a[b] = c.value);
      };
$jscomp.polyfill = function (a, b, c, d) {
  if (b) {
    c = $jscomp.global;
    a = a.split(".");
    for (d = 0; d < a.length - 1; d++) {
      var e = a[d];
      e in c || (c[e] = {});
      c = c[e];
    }
    a = a[a.length - 1];
    d = c[a];
    b = b(d);
    b != d &&
      null != b &&
      $jscomp.defineProperty(c, a, {
        configurable: !0,
        writable: !0,
        value: b,
      });
  }
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill(
  "Promise",
  function (a) {
    function b() {
      this.batch_ = null;
    }
    function c(a) {
      return a instanceof e
        ? a
        : new e(function (b, c) {
            b(a);
          });
    }
    if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
    b.prototype.asyncExecute = function (a) {
      if (null == this.batch_) {
        this.batch_ = [];
        var b = this;
        this.asyncExecuteFunction(function () {
          b.executeBatch_();
        });
      }
      this.batch_.push(a);
    };
    var d = $jscomp.global.setTimeout;
    b.prototype.asyncExecuteFunction = function (a) {
      d(a, 0);
    };
    b.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var a = this.batch_;
        this.batch_ = [];
        for (var b = 0; b < a.length; ++b) {
          var c = a[b];
          a[b] = null;
          try {
            c();
          } catch (l) {
            this.asyncThrow_(l);
          }
        }
      }
      this.batch_ = null;
    };
    b.prototype.asyncThrow_ = function (a) {
      this.asyncExecuteFunction(function () {
        throw a;
      });
    };
    var e = function (a) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      var b = this.createResolveAndReject_();
      try {
        a(b.resolve, b.reject);
      } catch (h) {
        b.reject(h);
      }
    };
    e.prototype.createResolveAndReject_ = function () {
      function a(a) {
        return function (d) {
          c || ((c = !0), a.call(b, d));
        };
      }
      var b = this,
        c = !1;
      return { resolve: a(this.resolveTo_), reject: a(this.reject_) };
    };
    e.prototype.resolveTo_ = function (a) {
      if (a === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (a instanceof e) this.settleSameAsPromise_(a);
      else {
        a: switch (typeof a) {
          case "object":
            var b = null != a;
            break a;
          case "function":
            b = !0;
            break a;
          default:
            b = !1;
        }
        b ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a);
      }
    };
    e.prototype.resolveToNonPromiseObj_ = function (a) {
      var b = void 0;
      try {
        b = a.then;
      } catch (h) {
        this.reject_(h);
        return;
      }
      "function" == typeof b
        ? this.settleSameAsThenable_(b, a)
        : this.fulfill_(a);
    };
    e.prototype.reject_ = function (a) {
      this.settle_(2, a);
    };
    e.prototype.fulfill_ = function (a) {
      this.settle_(1, a);
    };
    e.prototype.settle_ = function (a, b) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            a +
            ", " +
            b +
            "): Promise already settled in state" +
            this.state_,
        );
      this.state_ = a;
      this.result_ = b;
      this.executeOnSettledCallbacks_();
    };
    e.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var a = 0; a < this.onSettledCallbacks_.length; ++a)
          f.asyncExecute(this.onSettledCallbacks_[a]);
        this.onSettledCallbacks_ = null;
      }
    };
    var f = new b();
    e.prototype.settleSameAsPromise_ = function (a) {
      var b = this.createResolveAndReject_();
      a.callWhenSettled_(b.resolve, b.reject);
    };
    e.prototype.settleSameAsThenable_ = function (a, b) {
      var c = this.createResolveAndReject_();
      try {
        a.call(b, c.resolve, c.reject);
      } catch (l) {
        c.reject(l);
      }
    };
    e.prototype.then = function (a, b) {
      function c(a, b) {
        return "function" == typeof a
          ? function (b) {
              try {
                d(a(b));
              } catch (m) {
                f(m);
              }
            }
          : b;
      }
      var d,
        f,
        g = new e(function (a, b) {
          d = a;
          f = b;
        });
      this.callWhenSettled_(c(a, d), c(b, f));
      return g;
    };
    e.prototype.catch = function (a) {
      return this.then(void 0, a);
    };
    e.prototype.callWhenSettled_ = function (a, b) {
      function c() {
        switch (d.state_) {
          case 1:
            a(d.result_);
            break;
          case 2:
            b(d.result_);
            break;
          default:
            throw Error("Unexpected state: " + d.state_);
        }
      }
      var d = this;
      null == this.onSettledCallbacks_
        ? f.asyncExecute(c)
        : this.onSettledCallbacks_.push(c);
    };
    e.resolve = c;
    e.reject = function (a) {
      return new e(function (b, c) {
        c(a);
      });
    };
    e.race = function (a) {
      return new e(function (b, d) {
        for (
          var e = $jscomp.makeIterator(a), f = e.next();
          !f.done;
          f = e.next()
        )
          c(f.value).callWhenSettled_(b, d);
      });
    };
    e.all = function (a) {
      var b = $jscomp.makeIterator(a),
        d = b.next();
      return d.done
        ? c([])
        : new e(function (a, e) {
            function f(b) {
              return function (c) {
                g[b] = c;
                h--;
                0 == h && a(g);
              };
            }
            var g = [],
              h = 0;
            do
              g.push(void 0),
                h++,
                c(d.value).callWhenSettled_(f(g.length - 1), e),
                (d = b.next());
            while (!d.done);
          });
    };
    return e;
  },
  "es6",
  "es3",
);
$jscomp.owns = function (a, b) {
  return Object.prototype.hasOwnProperty.call(a, b);
};
$jscomp.polyfill(
  "Object.entries",
  function (a) {
    return a
      ? a
      : function (a) {
          var b = [],
            d;
          for (d in a) $jscomp.owns(a, d) && b.push([d, a[d]]);
          return b;
        };
  },
  "es8",
  "es3",
);
$jscomp.assign =
  "function" == typeof Object.assign
    ? Object.assign
    : function (a, b) {
        for (var c = 1; c < arguments.length; c++) {
          var d = arguments[c];
          if (d) for (var e in d) $jscomp.owns(d, e) && (a[e] = d[e]);
        }
        return a;
      };
$jscomp.polyfill(
  "Object.assign",
  function (a) {
    return a || $jscomp.assign;
  },
  "es6",
  "es3",
);
$jscomp.findInternal = function (a, b, c) {
  a instanceof String && (a = String(a));
  for (var d = a.length, e = 0; e < d; e++) {
    var f = a[e];
    if (b.call(c, f, e, a)) return { i: e, v: f };
  }
  return { i: -1, v: void 0 };
};
$jscomp.polyfill(
  "Array.prototype.find",
  function (a) {
    return a
      ? a
      : function (a, c) {
          return $jscomp.findInternal(this, a, c).v;
        };
  },
  "es6",
  "es3",
);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.SymbolClass = function (a, b) {
  this.$jscomp$symbol$id_ = a;
  $jscomp.defineProperty(this, "description", {
    configurable: !0,
    writable: !0,
    value: b,
  });
};
$jscomp.SymbolClass.prototype.toString = function () {
  return this.$jscomp$symbol$id_;
};
$jscomp.Symbol = (function () {
  function a(c) {
    if (this instanceof a) throw new TypeError("Symbol is not a constructor");
    return new $jscomp.SymbolClass(
      $jscomp.SYMBOL_PREFIX + (c || "") + "_" + b++,
      c,
    );
  }
  var b = 0;
  return a;
})();
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();
  var a = $jscomp.global.Symbol.iterator;
  a ||
    (a = $jscomp.global.Symbol.iterator =
      $jscomp.global.Symbol("Symbol.iterator"));
  "function" != typeof Array.prototype[a] &&
    $jscomp.defineProperty(Array.prototype, a, {
      configurable: !0,
      writable: !0,
      value: function () {
        return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
      },
    });
  $jscomp.initSymbolIterator = function () {};
};
$jscomp.initSymbolAsyncIterator = function () {
  $jscomp.initSymbol();
  var a = $jscomp.global.Symbol.asyncIterator;
  a ||
    (a = $jscomp.global.Symbol.asyncIterator =
      $jscomp.global.Symbol("Symbol.asyncIterator"));
  $jscomp.initSymbolAsyncIterator = function () {};
};
$jscomp.iteratorPrototype = function (a) {
  $jscomp.initSymbolIterator();
  a = { next: a };
  a[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };
  return a;
};
$jscomp.iteratorFromArray = function (a, b) {
  $jscomp.initSymbolIterator();
  a instanceof String && (a += "");
  var c = 0,
    d = {
      next: function () {
        if (c < a.length) {
          var e = c++;
          return { value: b(e, a[e]), done: !1 };
        }
        d.next = function () {
          return { done: !0, value: void 0 };
        };
        return d.next();
      },
    };
  d[Symbol.iterator] = function () {
    return d;
  };
  return d;
};
$jscomp.polyfill(
  "Array.prototype.entries",
  function (a) {
    return a
      ? a
      : function () {
          return $jscomp.iteratorFromArray(this, function (a, c) {
            return [a, c];
          });
        };
  },
  "es6",
  "es3",
);
$jscomp.polyfill(
  "Array.from",
  function (a) {
    return a
      ? a
      : function (a, c, d) {
          c =
            null != c
              ? c
              : function (a) {
                  return a;
                };
          var b = [],
            f =
              "undefined" != typeof Symbol &&
              Symbol.iterator &&
              a[Symbol.iterator];
          if ("function" == typeof f) {
            a = f.call(a);
            for (var g = 0; !(f = a.next()).done; )
              b.push(c.call(d, f.value, g++));
          } else
            for (f = a.length, g = 0; g < f; g++) b.push(c.call(d, a[g], g));
          return b;
        };
  },
  "es6",
  "es3",
);
$jscomp.polyfill(
  "Object.is",
  function (a) {
    return a
      ? a
      : function (a, c) {
          return a === c ? 0 !== a || 1 / a === 1 / c : a !== a && c !== c;
        };
  },
  "es6",
  "es3",
);
$jscomp.polyfill(
  "Array.prototype.includes",
  function (a) {
    return a
      ? a
      : function (a, c) {
          var b = this;
          b instanceof String && (b = String(b));
          var e = b.length;
          c = c || 0;
          for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
            var f = b[c];
            if (f === a || Object.is(f, a)) return !0;
          }
          return !1;
        };
  },
  "es7",
  "es3",
);
$jscomp.checkStringArgs = function (a, b, c) {
  if (null == a)
    throw new TypeError(
      "The 'this' value for String.prototype." +
        c +
        " must not be null or undefined",
    );
  if (b instanceof RegExp)
    throw new TypeError(
      "First argument to String.prototype." +
        c +
        " must not be a regular expression",
    );
  return a + "";
};
$jscomp.polyfill(
  "String.prototype.includes",
  function (a) {
    return a
      ? a
      : function (a, c) {
          return (
            -1 !==
            $jscomp.checkStringArgs(this, a, "includes").indexOf(a, c || 0)
          );
        };
  },
  "es6",
  "es3",
);
var EventEmitter = function () {
  this.events = {};
};
EventEmitter.prototype.on = function (a, b) {
  "object" !== typeof this.events[a] && (this.events[a] = []);
  this.events[a].push(b);
};
EventEmitter.prototype.removeListener = function (a, b) {
  "object" === typeof this.events[a] &&
    ((b = this.indexOf(this.events[a], b)),
    -1 < b && this.events[a].splice(b, 1));
};
EventEmitter.prototype.emit = function (a) {
  var b,
    c = [].slice.call(arguments, 1);
  if ("object" === typeof this.events[a]) {
    var d = this.events[a].slice();
    var e = d.length;
    for (b = 0; b < e; b++) d[b].apply(this, c);
  }
};
EventEmitter.prototype.once = function (a, b) {
  this.on(a, function d() {
    this.removeListener(a, d);
    b.apply(this, arguments);
  });
};
var loadScript = function (a, b, c) {
    return new Promise(function (d, e) {
      var f = document.createElement("script");
      f.async = !0;
      f.src = a;
      for (
        var g = $jscomp.makeIterator(Object.entries(b || {})), k = g.next();
        !k.done;
        k = g.next()
      ) {
        var h = $jscomp.makeIterator(k.value);
        k = h.next().value;
        h = h.next().value;
        f.setAttribute(k, h);
      }
      f.onload = function () {
        f.onerror = f.onload = null;
        d(f);
      };
      f.onerror = function () {
        f.onerror = f.onload = null;
        e(Error("Failed to load " + a));
      };
      (
        c ||
        document.head ||
        document.getElementsByTagName("head")[0]
      ).appendChild(f);
    });
  },
  YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api",
  YOUTUBE_STATES = {
    "-1": "unstarted",
    0: "ended",
    1: "playing",
    2: "paused",
    3: "buffering",
    5: "cued",
  },
  YOUTUBE_ERROR = {
    INVALID_PARAM: 2,
    HTML5_ERROR: 5,
    NOT_FOUND: 100,
    UNPLAYABLE_1: 101,
    UNPLAYABLE_2: 150,
  },
  loadIframeAPICallbacks = [],
  $Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0 =
    function (a, b) {
      EventEmitter.call(this);
      var c = this;
      a = "string" === typeof a ? document.querySelector(a) : a;
      this._id = a.id
        ? a.id
        : (a.id = "ytplayer-" + Math.random().toString(16).slice(2, 8));
      this._opts = Object.assign(
        {
          width: 640,
          height: 360,
          autoplay: !1,
          captions: void 0,
          controls: !0,
          keyboard: !0,
          fullscreen: !0,
          annotations: !0,
          modestBranding: !1,
          related: !0,
          timeupdateFrequency: 1e3,
          playsInline: !0,
          start: 0,
        },
        b,
      );
      this.videoId = null;
      this.destroyed = !1;
      this._api = null;
      this._autoplay = !1;
      this._player = null;
      this._ready = !1;
      this._queue = [];
      this.replayInterval = [];
      this._interval = null;
      this._startInterval = this._startInterval.bind(this);
      this._stopInterval = this._stopInterval.bind(this);
      this.on("playing", this._startInterval);
      this.on("unstarted", this._stopInterval);
      this.on("ended", this._stopInterval);
      this.on("paused", this._stopInterval);
      this.on("buffering", this._stopInterval);
      this._loadIframeAPI(function (a, b) {
        if (a) return c._destroy(Error("YouTube Iframe API failed to load"));
        c._api = b;
        c.videoId && c.load(c.videoId, c._autoplay, c._start);
      });
    };
$jscomp.inherits(
  $Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0,
  EventEmitter,
);
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.indexOf =
  function (a, b) {
    for (var c = 0, d = a.length, e = -1, f = !1; c < d && !f; )
      a[c] === b && ((e = c), (f = !0)), c++;
    return e;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.load =
  function (a, b, c) {
    b = void 0 === b ? !1 : b;
    c = void 0 === c ? 0 : c;
    this.destroyed ||
      (this._startOptimizeDisplayEvent(),
      this._optimizeDisplayHandler("center, center"),
      (this.videoId = a),
      (this._autoplay = b),
      (this._start = c),
      this._api &&
        (this._player
          ? this._ready &&
            (b
              ? this._player.loadVideoById(a, c)
              : this._player.cueVideoById(a, c))
          : this._createPlayer(a)));
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.play =
  function () {
    this._ready ? this._player.playVideo() : this._queueCommand("play");
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.replayFrom =
  function (a) {
    var b = this;
    !this.replayInterval.find(function (a) {
      return a.iframeParent === b._player.i.parentNode;
    }) &&
      a &&
      this.replayInterval.push({
        iframeParent: this._player.i.parentNode,
        interval: setInterval(
          function () {
            if (
              b._player.getCurrentTime() >=
              b._player.getDuration() - Number(a)
            ) {
              b.seek(0);
              for (
                var c = $jscomp.makeIterator(b.replayInterval.entries()),
                  d = c.next();
                !d.done;
                d = c.next()
              ) {
                d = $jscomp.makeIterator(d.value);
                var e = d.next().value;
                d.next();
                Object.hasOwnProperty.call(b.replayInterval, e) &&
                  (clearInterval(b.replayInterval[e].interval),
                  b.replayInterval.splice(e, 1));
              }
            }
          },
          1e3 * Number(a),
        ),
      });
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.pause =
  function () {
    this._ready ? this._player.pauseVideo() : this._queueCommand("pause");
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.stop =
  function () {
    this._ready ? this._player.stopVideo() : this._queueCommand("stop");
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.seek =
  function (a) {
    this._ready ? this._player.seekTo(a, !0) : this._queueCommand("seek", a);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._optimizeDisplayHandler =
  function (a) {
    if (this._player) {
      var b = this._player.i;
      a = a.split(",");
      if (b) {
        var c;
        if ((c = b.parentElement)) {
          var d = window.getComputedStyle(c);
          var e =
            c.clientHeight +
            parseFloat(d.marginTop, 10) +
            parseFloat(d.marginBottom, 10) +
            parseFloat(d.borderTopWidth, 10) +
            parseFloat(d.borderBottomWidth, 10);
          c =
            c.clientWidth +
            parseFloat(d.marginLeft, 10) +
            parseFloat(d.marginRight, 10) +
            parseFloat(d.borderLeftWidth, 10) +
            parseFloat(d.borderRightWidth, 10);
          e += 80;
          b.style.width = c + "px";
          b.style.height =
            Math.ceil(parseFloat(b.style.width, 10) / 1.7) + "px";
          b.style.marginTop =
            Math.ceil(-((parseFloat(b.style.height, 10) - e) / 2)) + "px";
          b.style.marginLeft = 0;
          if ((d = parseFloat(b.style.height, 10) < e))
            (b.style.height = e + "px"),
              (b.style.width =
                Math.ceil(1.7 * parseFloat(b.style.height, 10)) + "px"),
              (b.style.marginTop = 0),
              (b.style.marginLeft =
                Math.ceil(-((parseFloat(b.style.width, 10) - c) / 2)) + "px");
          for (var f in a)
            if (a.hasOwnProperty(f))
              switch (a[f].replace(/ /g, "")) {
                case "top":
                  b.style.marginTop = d
                    ? -((parseFloat(b.style.height, 10) - e) / 2) + "px"
                    : 0;
                  break;
                case "bottom":
                  b.style.marginTop = d
                    ? 0
                    : -(parseFloat(b.style.height, 10) - e) + "px";
                  break;
                case "left":
                  b.style.marginLeft = 0;
                  break;
                case "right":
                  b.style.marginLeft = d
                    ? -(parseFloat(b.style.width, 10) - c)
                    : "0px";
                  break;
                default:
                  parseFloat(b.style.width, 10) > c &&
                    (b.style.marginLeft =
                      -((parseFloat(b.style.width, 10) - c) / 2) + "px");
              }
        }
      }
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.stopResize =
  function () {
    window.removeEventListener("resize", this._resizeListener);
    this._resizeListener = null;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.stopReplay =
  function (a) {
    for (
      var b = $jscomp.makeIterator(this.replayInterval.entries()), c = b.next();
      !c.done;
      c = b.next()
    ) {
      c = $jscomp.makeIterator(c.value);
      var d = c.next().value;
      c.next();
      Object.hasOwnProperty.call(this.replayInterval, d) &&
        a === this.replayInterval[d].iframeParent &&
        (clearInterval(this.replayInterval[d].interval),
        this.replayInterval.splice(d, 1));
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.setVolume =
  function (a) {
    this._ready
      ? this._player.setVolume(a)
      : this._queueCommand("setVolume", a);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.loadPlaylist =
  function () {
    this._ready
      ? this._player.loadPlaylist(this.videoId)
      : this._queueCommand("loadPlaylist", this.videoId);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.setLoop =
  function (a) {
    this._ready ? this._player.setLoop(a) : this._queueCommand("setLoop", a);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getVolume =
  function () {
    return (this._ready && this._player.getVolume()) || 0;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.mute =
  function () {
    this._ready ? this._player.mute() : this._queueCommand("mute");
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.unMute =
  function () {
    this._ready ? this._player.unMute() : this._queueCommand("unMute");
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.isMuted =
  function () {
    return (this._ready && this._player.isMuted()) || !1;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.setSize =
  function (a, b) {
    this._ready
      ? this._player.setSize(a, b)
      : this._queueCommand("setSize", a, b);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.setPlaybackRate =
  function (a) {
    this._ready
      ? this._player.setPlaybackRate(a)
      : this._queueCommand("setPlaybackRate", a);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.setPlaybackQuality =
  function (a) {
    this._ready
      ? this._player.setPlaybackQuality(a)
      : this._queueCommand("setPlaybackQuality", a);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getPlaybackRate =
  function () {
    return (this._ready && this._player.getPlaybackRate()) || 1;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getAvailablePlaybackRates =
  function () {
    return (this._ready && this._player.getAvailablePlaybackRates()) || [1];
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getDuration =
  function () {
    return (this._ready && this._player.getDuration()) || 0;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getProgress =
  function () {
    return (this._ready && this._player.getVideoLoadedFraction()) || 0;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getState =
  function () {
    return (
      (this._ready && YOUTUBE_STATES[this._player.getPlayerState()]) ||
      "unstarted"
    );
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.getCurrentTime =
  function () {
    return (this._ready && this._player.getCurrentTime()) || 0;
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype.destroy =
  function () {
    this._destroy();
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._destroy =
  function (a) {
    this.destroyed ||
      ((this.destroyed = !0),
      this._player &&
        (this._player.stopVideo && this._player.stopVideo(),
        this._player.destroy()),
      (this._player = this._api = this._opts = this._id = this.videoId = null),
      (this._ready = !1),
      (this._queue = null),
      this._stopInterval(),
      this.removeListener("playing", this._startInterval),
      this.removeListener("paused", this._stopInterval),
      this.removeListener("buffering", this._stopInterval),
      this.removeListener("unstarted", this._stopInterval),
      this.removeListener("ended", this._stopInterval),
      a && this.emit("error", a));
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._queueCommand =
  function (a, b) {
    for (var c = [], d = 1; d < arguments.length; ++d) c[d - 1] = arguments[d];
    this.destroyed || this._queue.push([a, c]);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._flushQueue =
  function () {
    for (; this._queue.length; ) {
      var a = this._queue.shift();
      this[a[0]].apply(this, a[1]);
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._loadIframeAPI =
  function (a) {
    if (window.YT && "function" === typeof window.YT.Player)
      return a(null, window.YT);
    loadIframeAPICallbacks.push(a);
    Array.from(document.getElementsByTagName("script")).some(function (a) {
      return a.src === YOUTUBE_IFRAME_API_SRC;
    }) ||
      loadScript(YOUTUBE_IFRAME_API_SRC).catch(function (a) {
        for (; loadIframeAPICallbacks.length; )
          loadIframeAPICallbacks.shift()(a);
      });
    var b = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      for ("function" === typeof b && b(); loadIframeAPICallbacks.length; )
        loadIframeAPICallbacks.shift()(null, window.YT);
    };
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._createPlayer =
  function (a) {
    var b = this;
    if (!this.destroyed) {
      var c = this._opts;
      this._player = new this._api.Player(this._id, {
        width: c.width,
        height: c.height,
        videoId: a,
        host: c.host,
        playerVars: {
          autoplay: c.autoplay ? 1 : 0,
          mute: c.mute ? 1 : 0,
          hl: null != c.captions && !1 !== c.captions ? c.captions : void 0,
          cc_lang_pref:
            null != c.captions && !1 !== c.captions ? c.captions : void 0,
          controls: c.controls ? 2 : 0,
          enablejsapi: 1,
          allowfullscreen: !0,
          iv_load_policy: c.annotations ? 1 : 3,
          modestbranding: c.modestBranding ? 1 : 0,
          origin: "*",
          rel: c.related ? 1 : 0,
          mode: "transparent",
          showinfo: 0,
          html5: 1,
          version: 3,
          playerapiid: "iframe_YTP_1624972482514",
        },
        events: {
          onReady: function () {
            return b._onReady(a);
          },
          onStateChange: function (a) {
            return b._onStateChange(a);
          },
          onPlaybackQualityChange: function (a) {
            return b._onPlaybackQualityChange(a);
          },
          onPlaybackRateChange: function (a) {
            return b._onPlaybackRateChange(a);
          },
          onError: function (a) {
            return b._onError(a);
          },
        },
      });
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onReady =
  function (a) {
    this.destroyed ||
      ((this._ready = !0),
      this.load(this.videoId, this._autoplay, this._start),
      this._flushQueue());
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onStateChange =
  function (a) {
    if (!this.destroyed) {
      var b = YOUTUBE_STATES[a.data];
      if (b)
        ["paused", "buffering", "ended"].includes(b) && this._onTimeupdate(),
          this.emit(b),
          ["unstarted", "playing", "cued"].includes(b) && this._onTimeupdate();
      else throw Error("Unrecognized state change: " + a);
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onPlaybackQualityChange =
  function (a) {
    this.destroyed || this.emit("playbackQualityChange", a.data);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onPlaybackRateChange =
  function (a) {
    this.destroyed || this.emit("playbackRateChange", a.data);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onError =
  function (a) {
    if (!this.destroyed && ((a = a.data), a !== YOUTUBE_ERROR.HTML5_ERROR)) {
      if (
        a === YOUTUBE_ERROR.UNPLAYABLE_1 ||
        a === YOUTUBE_ERROR.UNPLAYABLE_2 ||
        a === YOUTUBE_ERROR.NOT_FOUND ||
        a === YOUTUBE_ERROR.INVALID_PARAM
      )
        return this.emit("unplayable", this.videoId);
      this._destroy(Error("YouTube Player Error. Unknown error code: " + a));
    }
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._startOptimizeDisplayEvent =
  function () {
    var a = this;
    this._resizeListener ||
      ((this._resizeListener = function () {
        return a._optimizeDisplayHandler("center, center");
      }),
      window.addEventListener("resize", this._resizeListener));
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._onTimeupdate =
  function () {
    this.emit("timeupdate", this.getCurrentTime());
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._startInterval =
  function () {
    var a = this;
    this._interval = setInterval(function () {
      return a._onTimeupdate();
    }, this._opts.timeupdateFrequency);
  };
$Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0.prototype._stopInterval =
  function () {
    clearInterval(this._interval);
    this._interval = null;
  };
YouTubePlayer =
  $Users$minim$workspace$Mobirise5_emac_Release$Release$release$mac$Mobirise_app$Contents$Resources$_app_asar$web$app$themes$startm5$plugins$ytplayer$index$classdecl$var0;
