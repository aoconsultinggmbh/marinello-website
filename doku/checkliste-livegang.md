# Checkliste Livegang

Reihenfolge einhalten. Abgehakt wird erst, wenn es geprüft ist – nicht, wenn es
eingestellt wurde.

Erprobt am 21.09.2026 beim ersten Livegang (S. Kiefer Dental-Labor).

---

## Vorher klären (fragen dauert am längsten, also zuerst)

- [ ] Wo liegt die **Domain**? Zugang vorhanden?
- [ ] Wo liegen die **Postfächer**? → MX-Einträge im DNS nachsehen
- [ ] An welche Adresse gehen **Formular-Anfragen**?
- [ ] **Google-Konto** für die Search Console vorhanden?
- [ ] Gibt es eine **Vorgängerseite**? Dann deren Unterseiten auflisten (für die
      Weiterleitungen) und eine Sicherung ziehen

---

## Phase 1 – All-Inkl vorbereiten (nach außen passiert nichts)

- [ ] KAS → **Accounts** → Account anlegen, eigenes Konto je Kunde

      ⚠ In der Spalte „reserviert" heißt `0` **nicht** unbegrenzt, sondern
      „nichts zugeteilt". Echte Werte eintragen: Domains 2, Subdomains 5,
      **Speicherplatz** (z. B. 10000 MB), Datenbanken 1, FTP-Nutzer 2, Cronjobs 1.

- [ ] Im Kundenkonto → **Domain** → Domain hinzufügen →
      „Domain ist bereits bei einem anderen Anbieter registriert"
- [ ] → **Subdomain** → `www` anlegen, **gleiches Zielverzeichnis**

      ⚠ Ohne eigenen `www`-Eintrag gibt es kein Zertifikat für `www`, und jeder
      Besucher sieht eine rote Warnseite. Das kostet sonst eine halbe Stunde.

- [ ] **FTP-Zugang** im Kundenkonto anlegen, Zugangsdaten in den Passwort-Manager
- [ ] **PHP-Version** auf 8.1 oder höher
- [ ] Server-Adresse (`w0…kasserver.com`) und **IP-Adresse** notieren

## Phase 2 – Secrets in GitHub

Projekt → Settings → Secrets and variables → Actions → New repository secret:

- [ ] `FTP_SERVER`
- [ ] `FTP_BENUTZER`
- [ ] `FTP_PASSWORT`
- [ ] `FTP_ORDNER`

## Phase 3 – Inhalte scharf schalten

- [ ] `DOMAIN` ersetzen in: `index.html` (canonical), `robots.txt`, `sitemap.xml`,
      `.htaccess`, `anfrage-senden.php`
- [ ] Entwurfs-Hinweise raus (gelbe Kästen, „Vorschau-Modus")
- [ ] Formular: Empfängeradresse abgestimmt, Absender ist eine **echte Adresse auf
      derselben Domain** (sonst Spam)
- [ ] Impressum vollständig (Umsatzsteuer-ID, Kammer, Streitschlichtung)
- [ ] Datenschutzerklärung vollständig und **wahr** – sie muss beschreiben, was die
      Seite wirklich tut
- [ ] Bei Arztpraxen: Hinweis, keine Gesundheitsdaten über das Formular zu senden

## Phase 4 – Hochladen und auf dem echten Server testen

- [ ] Zweig `live` auf `main` setzen, Ablauf läuft grün durch
- [ ] Seite über die **Übergangsadresse** prüfen:
      `http://<domain>.<konto>.kasserver.com/`

      Kommt die alte Seite: Chrome hat die Umleitung gespeichert → `?frisch=1`
      anhängen. Kommt sie immer noch: die `.htaccess`-Ausnahme für `kasserver.com`
      fehlt.

- [ ] Alle Seiten laden, keine kaputten Bilder
- [ ] Handybreite 390 px geprüft
- [ ] `anfrage-senden.php` antwortet auf einen normalen Aufruf mit **405** (richtig so)
- [ ] **Echte Testanfrage kommt im Postfach an, nicht im Spam** ← wichtigster Test

Bis hierher ist nach außen nichts passiert.

## Phase 5 – DNS umstellen

Vormittags unter der Woche. TTL **nachmessen**, nicht der Anzeige glauben.

- [ ] **SPF zuerst** (TXT-Einträge haben oft 6 Stunden Vorlauf):
      `ip4:85.13.128.0/18 ip4:185.3.40.0/22` hinter `v=spf1 a` **ergänzen**,
      nichts entfernen. Nachschlagevorgänge zählen – über zehn wird der ganze
      Eintrag ungültig und **alle** Mails leiden.
- [ ] Alte Werte aufschreiben
- [ ] `A` für `@` → IP von All-Inkl
- [ ] `A` für `www` → dieselbe IP
- [ ] `AAAA` für `@` **löschen** (All-Inkl hat kein IPv6)
- [ ] `AAAA` für `www` **löschen**

      Die vier zügig hintereinander, sonst sehen IPv6-Besucher noch die alte Seite.

- [ ] **Nicht angefasst:** MX, `mail.`, `mailout.`, `autodiscover.`, DKIM

**Rückweg:** alte IP wieder eintragen, nach zehn Minuten ist alles wie vorher.

## Phase 6 – Sofort danach

- [ ] SSL im KAS: Let's Encrypt **für Domain und `www` getrennt**
- [ ] `http` → `https` geprüft
- [ ] ohne `www` → mit `www` geprüft
- [ ] Zertifikat deckt **beide** Namen ab
- [ ] Alte Adressen als `Redirect 301` in der `.htaccess`, jede einzeln geprüft

## Phase 7 – Google (am selben Tag)

- [ ] Search Console → Property → **URL-Präfix** `https://www.DOMAIN/`
- [ ] Bestätigung per **HTML-Datei** (ins Projekt legen, hochladen, bestätigen) —
      die Datei muss dauerhaft liegen bleiben
- [ ] **Sitemaps** → `sitemap.xml` senden
- [ ] Google-Unternehmensprofil: Webseiten-Adresse aktualisieren

## Phase 8 – Besucherzählung

- [ ] In Matomo (`statistik.ao-consult.de`) die Seite anlegen → **Seiten-Nummer** merken
- [ ] Nummer in `website/assets/js/statistik.js` eintragen
- [ ] `<script src="assets/js/statistik.js" defer></script>` auf **allen** Seiten
      (Unterseiten brauchen `../assets/...`)
- [ ] Datenschutzabschnitt zur Messung eingebaut
- [ ] Geprüft: Seite setzt **keine Cookies**, Besuch erscheint in Matomo

## Phase 9 – Aufräumen (eine Woche später)

- [ ] Eine Woche Ruhe abwarten
- [ ] Sicherung der alten Seite vorhanden
- [ ] **An einem Rechner beim Kunden prüfen:** steht in Outlook `mail.DOMAIN`?
      Wenn ja, stirbt deren Mail mit der Kündigung des alten Webspace
- [ ] Erst dann: alten **Webspace** kündigen – nicht die Domain, nicht die Postfächer
