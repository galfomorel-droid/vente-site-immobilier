/* =================================================================
   CRÉATION SITE IMMOBILIER — Serveur de production (Railway / local)
   - Sert les fichiers statiques
   - Expose POST /api/contact (formulaire) avec envoi d'email optionnel
   Aucune dépendance obligatoire : nodemailer est chargé seulement si
   les variables SMTP_* sont configurées (sinon les messages sont loggués).
================================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 4173;
const MAX_BODY = 100 * 1024; // 100 Ko max pour le formulaire

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

/* ---------- Envoi d'email (optionnel, via SMTP) ---------- */
async function sendContactEmail(data) {
  const to = process.env.CONTACT_TO || 'contact@creationsiteimmobilier.fr';
  const host = process.env.SMTP_HOST;

  // Pas de SMTP configuré : on logue simplement (rien n'est perdu côté Railway logs).
  if (!host) {
    console.log('[CONTACT] (SMTP non configuré) Nouveau message :', JSON.stringify(data));
    return { delivered: false };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (e) {
    console.warn('[CONTACT] nodemailer non installé — message loggué :', JSON.stringify(data));
    return { delivered: false };
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: process.env.CONTACT_FROM || process.env.SMTP_USER || to,
    to: to,
    replyTo: data.email,
    subject: 'Nouvelle demande de devis — ' + (data.nom || 'site'),
    text:
      'Nom : ' + (data.nom || '') + '\n' +
      'Email : ' + (data.email || '') + '\n' +
      'Téléphone : ' + (data.tel || '') + '\n' +
      'Agence / réseau : ' + (data.agence || '') + '\n\n' +
      'Message :\n' + (data.message || '')
  });

  return { delivered: true };
}

/* ---------- Gestion du formulaire ---------- */
function handleContact(req, res) {
  let body = '';
  let tooBig = false;

  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > MAX_BODY) { tooBig = true; req.destroy(); }
  });

  req.on('end', async function () {
    if (tooBig) { res.writeHead(413); res.end('Payload too large'); return; }

    const params = new URLSearchParams(body);
    const data = {
      nom: (params.get('nom') || '').trim(),
      email: (params.get('email') || '').trim(),
      tel: (params.get('tel') || '').trim(),
      agence: (params.get('agence') || '').trim(),
      message: (params.get('message') || '').trim(),
      botField: (params.get('bot-field') || '').trim()
    };

    const json = (code, obj) => {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(obj));
    };

    // Piège anti-spam : si rempli, on accepte sans rien envoyer.
    if (data.botField) { return json(200, { ok: true }); }

    // Validation minimale
    if (!data.nom || !data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      return json(400, { ok: false, error: 'Champs nom et email valides requis.' });
    }

    try {
      await sendContactEmail(data);
    } catch (e) {
      console.error('[CONTACT] Échec envoi email :', e && e.message);
      // On ne bloque pas l'utilisateur ; le message reste visible dans les logs.
    }
    return json(200, { ok: true });
  });
}

/* ---------- Page 404 soignée ---------- */
function send404(res) {
  fs.readFile(path.join(ROOT, '404.html'), function (err, data) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(err ? '<h1>404 — Page introuvable</h1>' : data);
  });
}

/* ---------- Fichiers statiques ---------- */
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(ROOT, path.normalize(urlPath));

  // Empêche de sortir du dossier racine
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.stat(filePath, function (err, stat) {
    // URL « propre » sans extension -> tente le .html
    if (err || stat.isDirectory()) {
      const alt = filePath.replace(/\/$/, '') + '.html';
      return fs.readFile(alt, function (e2, data) {
        if (e2) { return send404(res); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    }
    fs.readFile(filePath, function (e3, data) {
      if (e3) { return send404(res); }
      var ext = path.extname(filePath).toLowerCase();
      var alwaysFresh = (ext === '.html' || ext === '.css' || ext === '.js');
      var headers = {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': alwaysFresh ? 'no-cache' : 'public, max-age=86400',
        // Sécurité
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      };
      if (ext === '.html') {
        headers['Content-Security-Policy'] =
          "default-src 'self'; " +
          "script-src 'self'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self'; " +
          "frame-ancestors 'self'; " +
          "form-action 'self'; " +
          "base-uri 'self'";
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  });
}

/* ---------- Serveur ---------- */
http.createServer(function (req, res) {
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/contact') {
    return handleContact(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  serveStatic(req, res);
}).listen(PORT, function () {
  console.log('Serveur en ligne sur le port ' + PORT);
});
