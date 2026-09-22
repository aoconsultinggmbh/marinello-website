/* ============================================================================
   KFO DR. MARINELLO, gemeinsames Skript aller Seiten
   Jeder Block prueft zuerst, ob sein Element existiert. So wirft eine
   Unterseite ohne Formular oder ohne Karte keinen Fehler.
   ============================================================================ */
(function () {
  'use strict';

  /* --------------------------------------- Kopf: Flaeche nach dem Scrollen */
  var kopf = document.querySelector('body > header');
  if (kopf) {
    var kopfPruefen = function () {
      if (window.scrollY > 40) kopf.classList.add('ist-gescrollt');
      else kopf.classList.remove('ist-gescrollt');
    };
    kopfPruefen();
    window.addEventListener('scroll', kopfPruefen, { passive: true });
  }

  /* ------------------------------------------- Einblenden beim Scrollen */
  var bewegungAus = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zeigen = document.querySelectorAll('.zeigen');
  if (zeigen.length) {
    if (bewegungAus || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(zeigen, function (el) { el.classList.add('ist-sichtbar'); });
    } else {
      var beobachter = new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('ist-sichtbar'); beobachter.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      Array.prototype.forEach.call(zeigen, function (el) { beobachter.observe(el); });
    }
  }

  /* ---------------------------------------------------- Aufklapp-Menue */
  var menue   = document.getElementById('menue');
  var oeffner = document.querySelectorAll('[data-menue-auf]');
  var zu      = document.querySelectorAll('[data-menue-zu]');

  if (menue && oeffner.length) {
    var zuletztFokussiert = null;

    var fokussierbare = function () {
      return Array.prototype.filter.call(
        menue.querySelectorAll('a[href], button:not([disabled])'),
        function (el) { return el.offsetParent !== null; }
      );
    };

    var auf = function (ausloeser) {
      zuletztFokussiert = ausloeser || document.activeElement;
      menue.setAttribute('data-offen', '');
      menue.removeAttribute('aria-hidden');
      document.documentElement.style.overflow = 'hidden';
      Array.prototype.forEach.call(oeffner, function (b) { b.setAttribute('aria-expanded', 'true'); });
      /* Fokus erst setzen, wenn der Dialog wirklich sichtbar ist */
      window.requestAnimationFrame(function () {
        var erste = menue.querySelector('[data-menue-zu]') || fokussierbare()[0];
        if (erste) erste.focus();
      });
    };

    var dicht = function () {
      menue.removeAttribute('data-offen');
      menue.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      Array.prototype.forEach.call(oeffner, function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (zuletztFokussiert && typeof zuletztFokussiert.focus === 'function') zuletztFokussiert.focus();
    };

    Array.prototype.forEach.call(oeffner, function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () { auf(b); });
    });
    Array.prototype.forEach.call(zu, function (b) {
      b.addEventListener('click', dicht);
    });

    document.addEventListener('keydown', function (e) {
      if (!menue.hasAttribute('data-offen')) return;
      if (e.key === 'Escape') { e.preventDefault(); dicht(); return; }
      if (e.key !== 'Tab') return;
      /* Fokus im offenen Menue halten */
      var liste = fokussierbare();
      if (!liste.length) return;
      var erster = liste[0];
      var letzter = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === erster) { e.preventDefault(); letzter.focus(); }
      else if (!e.shiftKey && document.activeElement === letzter) { e.preventDefault(); erster.focus(); }
    });

    /* Klick auf einen Menuepunkt schliesst das Menue */
    Array.prototype.forEach.call(menue.querySelectorAll('a[href]'), function (a) {
      a.addEventListener('click', function () { dicht(); });
    });
  }

  /* ------------------------------------------------- Karte nach Einwilligung */
  var karten = document.querySelectorAll('[data-einbettung="karte"]');

  var karteLaden = function (halter) {
    if (halter.getAttribute('data-geladen') === 'ja') return;
    var quelle = halter.getAttribute('data-quelle');
    if (!quelle) return;
    var rahmen = document.createElement('iframe');
    rahmen.src = quelle;
    rahmen.title = halter.getAttribute('data-titel') || 'Karte';
    rahmen.loading = 'lazy';
    rahmen.referrerPolicy = 'no-referrer-when-downgrade';
    rahmen.setAttribute('allowfullscreen', '');
    halter.setAttribute('data-geladen', 'ja');
    halter.innerHTML = '';
    halter.appendChild(rahmen);
  };

  var kartenPruefen = function () {
    Array.prototype.forEach.call(karten, function (halter) {
      /* Ohne Einwilligungsschnittstelle laedt vorsichtshalber nichts */
      if (window.aoEinwilligung && window.aoEinwilligung.erlaubt('karte')) karteLaden(halter);
    });
  };

  if (karten.length) {
    Array.prototype.forEach.call(karten, function (halter) {
      var knopf = halter.querySelector('[data-karte-laden]');
      if (!knopf) return;
      knopf.addEventListener('click', function () {
        if (window.aoEinwilligung) window.aoEinwilligung.setze('karte', true);
        karteLaden(halter);
      });
    });
    document.addEventListener('ao:einwilligung', kartenPruefen);
    kartenPruefen();
  }

  /* ------------------------------------------------------------- Formular */
  var formular = document.querySelector('[data-formular]');
  if (formular) {
    formular.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!formular.checkValidity()) { formular.reportValidity(); return; }
      var danke = document.getElementById('formular-danke');
      formular.hidden = true;
      if (danke) { danke.hidden = false; danke.setAttribute('tabindex', '-1'); danke.focus(); }
    });
  }

  /* ------------------------------------------------ Flaechen mit Bildmotiv
     Die Motive liegen als Hintergrundbild in data-flaeche. Gesetzt wird es
     erst, wenn die Flaeche in die Naehe des Sichtfelds kommt. Das ersetzt das
     loading="lazy" der frueheren img-Elemente. Ohne IntersectionObserver oder
     ohne JavaScript greift das img im <noscript>. */
  var flaechen = document.querySelectorAll('[data-flaeche]');
  if (flaechen.length) {
    var setzen = function (el) {
      el.style.cssText += ';' + el.dataset.flaeche;
      el.removeAttribute('data-flaeche');
    };
    if ('IntersectionObserver' in window) {
      var lader = new IntersectionObserver(function (eintraege, beobachter) {
        eintraege.forEach(function (e) {
          if (e.isIntersecting) {
            setzen(e.target);
            beobachter.unobserve(e.target);
          }
        });
      }, { rootMargin: '600px 0px' });
      Array.prototype.forEach.call(flaechen, function (el) { lader.observe(el); });
    } else {
      Array.prototype.forEach.call(flaechen, setzen);
    }
  }

  /* ------------------------------------ Sprechzeiten, Anzeige "jetzt offen"
     Rechnet die Ortszeit in Butzbach aus, unabhaengig davon, welche Zeitzone
     im Geraet des Besuchers eingestellt ist. Die Zeiten stehen hier an einer
     Stelle und muessen zur Datenschutzerklaerung, zum Impressum und zum
     JSON-LD der Seite passen. Wird eine Zeit geaendert, hier und in
     seiten3.py sowie seiten.py (JSON-LD) nachziehen.

     Gesetzliche Feiertage in Hessen sind einberechnet, sie werden im Browser
     aus dem Osterdatum ausgerechnet. Praxiseigene Schliesstage (Urlaub,
     Fortbildung, Heiligabend, Silvester) gehoeren in AUSNAHMEN. */
  var SPRECHZEITEN = {
    1: [['08:30', '12:00'], ['13:00', '18:30']],
    2: [['08:30', '12:00'], ['13:00', '18:30']],
    3: [['08:30', '12:00'], ['13:00', '18:30']],
    4: [['08:30', '12:00'], ['13:00', '18:30']],
    5: [['08:30', '12:00']],
    6: [],
    0: []
  };

  /* Praxiseigene Schliesstage. Format "JJJJ-MM-TT": "Grund".
     Beispiel: {'2026-12-24': 'Heiligabend', '2026-12-31': 'Silvester'} */
  var AUSNAHMEN = {};

  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  var status = document.querySelector('[data-sprechzeiten]');
  if (status) {
    var knopf = status.querySelector('.status__knopf');
    var text = status.querySelector('.status__text');
    var panel = status.querySelector('.status__panel');
    var lage = status.querySelector('[data-status-lage]');
    var liste = status.querySelector('[data-status-liste]');
    var naechsterFeiertag = status.querySelector('[data-status-feiertag]');

    /* ---------------------------------------------- Feiertage in Hessen
       Neun gesetzliche Feiertage nach dem Hessischen Feiertagsgesetz. Vier
       davon haengen am Osterdatum, es wird mit der Gaussschen Osterformel
       berechnet. Gerechnet wird in UTC, damit die Sommerzeit nicht
       hineinfunkt: es geht nur um Kalendertage, nicht um Uhrzeiten. */
    var feiertagsspeicher = {};

    function osterSonntag(jahr) {
      var a = jahr % 19, b = Math.floor(jahr / 100), c = jahr % 100;
      var d = Math.floor(b / 4), e = b % 4;
      var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
      var h = (19 * a + b - d - g + 15) % 30;
      var i = Math.floor(c / 4), k = c % 4;
      var l = (32 + 2 * e + 2 * i - h - k) % 7;
      var m = Math.floor((a + 11 * h + 22 * l) / 451);
      var monat = Math.floor((h + l - 7 * m + 114) / 31);
      var tag = ((h + l - 7 * m + 114) % 31) + 1;
      return Date.UTC(jahr, monat - 1, tag);
    }

    function alsSchluessel(ms) {
      var d = new Date(ms);
      var m = d.getUTCMonth() + 1, t = d.getUTCDate();
      return d.getUTCFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (t < 10 ? '0' + t : t);
    }

    function feiertage(jahr) {
      if (feiertagsspeicher[jahr]) { return feiertagsspeicher[jahr]; }
      var tag = 86400000, ostern = osterSonntag(jahr), liste = {};
      liste[alsSchluessel(Date.UTC(jahr, 0, 1))] = 'Neujahr';
      liste[alsSchluessel(ostern - 2 * tag)] = 'Karfreitag';
      liste[alsSchluessel(ostern + 1 * tag)] = 'Ostermontag';
      liste[alsSchluessel(Date.UTC(jahr, 4, 1))] = 'Tag der Arbeit';
      liste[alsSchluessel(ostern + 39 * tag)] = 'Christi Himmelfahrt';
      liste[alsSchluessel(ostern + 50 * tag)] = 'Pfingstmontag';
      liste[alsSchluessel(ostern + 60 * tag)] = 'Fronleichnam';
      liste[alsSchluessel(Date.UTC(jahr, 9, 3))] = 'Tag der Deutschen Einheit';
      liste[alsSchluessel(Date.UTC(jahr, 11, 25))] = '1. Weihnachtstag';
      liste[alsSchluessel(Date.UTC(jahr, 11, 26))] = '2. Weihnachtstag';
      feiertagsspeicher[jahr] = liste;
      return liste;
    }

    function grundGeschlossen(schluessel) {
      if (AUSNAHMEN[schluessel]) { return AUSNAHMEN[schluessel]; }
      var jahr = parseInt(schluessel.slice(0, 4), 10);
      var name = feiertage(jahr)[schluessel];
      return name ? name + ', Feiertag in Hessen' : null;
    }

    function ortszeit() {
      /* Datum und Uhrzeit in Europa/Berlin, egal wo der Besucher sitzt */
      var f = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit',
        day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
      });
      var teil = {};
      f.formatToParts(new Date()).forEach(function (p) { teil[p.type] = p.value; });
      var stunde = parseInt(teil.hour, 10) % 24;   /* 24:00 kommt bei manchen Browsern vor */
      var ms = Date.UTC(+teil.year, +teil.month - 1, +teil.day);
      return {
        ms: ms,
        tag: new Date(ms).getUTCDay(),
        minuten: stunde * 60 + parseInt(teil.minute, 10),
        datum: teil.year + '-' + teil.month + '-' + teil.day
      };
    }

    function inMinuten(uhr) {
      var s = uhr.split(':');
      return parseInt(s[0], 10) * 60 + parseInt(s[1], 10);
    }

    function alsUhr(minuten) {
      var h = Math.floor(minuten / 60), m = minuten % 60;
      return h + ':' + (m < 10 ? '0' + m : m) + ' Uhr';
    }

    function zeitenFuer(ms) {
      /* Sprechzeiten eines Kalendertages, Feiertage und Ausnahmen abgezogen */
      if (grundGeschlossen(alsSchluessel(ms))) { return []; }
      return SPRECHZEITEN[new Date(ms).getUTCDay()] || [];
    }

    function naechsteOeffnung(jetzt) {
      /* erst heute, dann bis zu 30 Tage weiter, Feiertage werden uebersprungen */
      var heute = zeitenFuer(jetzt.ms);
      for (var i = 0; i < heute.length; i++) {
        if (jetzt.minuten < inMinuten(heute[i][0])) {
          return { wann: 'heute um', zeit: inMinuten(heute[i][0]) };
        }
      }
      for (var n = 1; n <= 30; n++) {
        var ms = jetzt.ms + n * 86400000;
        var zeiten = zeitenFuer(ms);
        if (zeiten.length) {
          var d = new Date(ms);
          var wann = n === 1 ? 'morgen um'
            : (n < 7 ? 'am ' + TAGE[d.getUTCDay()] + ' um'
              : 'am ' + d.getUTCDate() + '. ' + MONATE[d.getUTCMonth()] + ' um');
          return { wann: wann, zeit: inMinuten(zeiten[0][0]) };
        }
      }
      return null;
    }

    function feiertagVoraus(jetzt) {
      /* naechster Feiertag innerhalb von 60 Tagen, der auf einen Sprechtag faellt */
      for (var n = 1; n <= 60; n++) {
        var ms = jetzt.ms + n * 86400000;
        var d = new Date(ms);
        if (!(SPRECHZEITEN[d.getUTCDay()] || []).length) { continue; }
        var grund = grundGeschlossen(alsSchluessel(ms));
        if (grund) {
          return KURZ[d.getUTCDay()] + ', ' + d.getUTCDate() + '. ' + MONATE[d.getUTCMonth()]
            + ': geschlossen, ' + grund;
        }
      }
      return '';
    }

    function aktualisieren() {
      var jetzt = ortszeit();
      var zeiten = zeitenFuer(jetzt.ms);
      var grundHeute = grundGeschlossen(jetzt.datum);
      var offen = null;
      zeiten.forEach(function (z) {
        if (jetzt.minuten >= inMinuten(z[0]) && jetzt.minuten < inMinuten(z[1])) { offen = z; }
      });

      if (offen) {
        status.setAttribute('data-offen', '');
        text.textContent = 'Jetzt geöffnet';
        var spaeter = null;
        zeiten.forEach(function (z) {
          if (inMinuten(z[0]) > inMinuten(offen[1])) { spaeter = spaeter || z; }
        });
        lage.textContent = 'Die Praxis hat geöffnet bis ' + alsUhr(inMinuten(offen[1]))
          + (spaeter ? ', danach wieder ab ' + alsUhr(inMinuten(spaeter[0])) + '.' : '.');
      } else {
        status.removeAttribute('data-offen');
        var pause = zeiten.length > 1 && jetzt.minuten >= inMinuten(zeiten[0][1])
          && jetzt.minuten < inMinuten(zeiten[1][0]);
        var naechste = naechsteOeffnung(jetzt);
        var wieder = naechste
          ? ' Die Praxis öffnet wieder ' + naechste.wann + ' ' + alsUhr(naechste.zeit) + '.' : '';
        if (grundHeute) {
          text.textContent = 'Heute geschlossen';
          lage.textContent = 'Heute geschlossen: ' + grundHeute + '.' + wieder;
        } else if (pause) {
          text.textContent = 'Mittagspause';
          lage.textContent = 'Mittagspause, weiter geht es '
            + (naechste ? naechste.wann + ' ' + alsUhr(naechste.zeit) + '.' : 'in Kürze.');
        } else {
          text.textContent = 'Geschlossen';
          lage.textContent = naechste
            ? 'Geschlossen, die Praxis öffnet ' + naechste.wann + ' ' + alsUhr(naechste.zeit) + '.'
            : 'Zurzeit geschlossen.';
        }
      }

      liste.innerHTML = '';
      [1, 2, 3, 4, 5, 6, 0].forEach(function (tag) {
        var zeitenTag = SPRECHZEITEN[tag] || [];
        var li = document.createElement('li');
        var heute = tag === jetzt.tag;
        if (heute) { li.setAttribute('data-heute', ''); }
        var a = document.createElement('span');
        a.textContent = KURZ[tag];
        var b = document.createElement('span');
        b.textContent = heute && grundHeute ? 'geschlossen, ' + grundHeute
          : (zeitenTag.length
            ? zeitenTag.map(function (z) { return z[0] + '–' + z[1]; }).join(' und ') + ' Uhr'
            : 'geschlossen');
        li.appendChild(a);
        li.appendChild(b);
        liste.appendChild(li);
      });

      if (naechsterFeiertag) {
        var hinweis = feiertagVoraus(jetzt);
        naechsterFeiertag.textContent = hinweis;
        naechsterFeiertag.hidden = !hinweis;
      }

      status.hidden = false;
    }

    function panelSchliessen() {
      panel.hidden = true;
      knopf.setAttribute('aria-expanded', 'false');
    }

    knopf.addEventListener('click', function () {
      var auf = knopf.getAttribute('aria-expanded') === 'true';
      panel.hidden = auf;
      knopf.setAttribute('aria-expanded', auf ? 'false' : 'true');
    });
    document.addEventListener('click', function (e) {
      if (!status.contains(e.target)) { panelSchliessen(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && knopf.getAttribute('aria-expanded') === 'true') {
        panelSchliessen();
        knopf.focus();
      }
    });

    aktualisieren();
    setInterval(aktualisieren, 30000);
  }

  /* ------------------------------------------- Jahreszahl in der Fusszeile */
  Array.prototype.forEach.call(document.querySelectorAll('[data-jahr]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Den Widerruf in der Fusszeile behandelt einwilligung.js selbst,
     ueber das Attribut data-einwilligung-oeffnen. Hier nichts weiter noetig. */
})();
