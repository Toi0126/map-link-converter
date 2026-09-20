// ==UserScript==
// @name         Apple Maps to Google Maps
// @namespace    local.apple-maps-to-google
// @version      1.0.0
// @description  SafariのAppleマップリンクをGoogleマップへ自動変換
// @match        https://*/*
// @match        http://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// 作成日: 2026-09-20 JST
// URL変換テスト済み。iPhone実機での動作は未確認。
// 出典:
// https://github.com/quoid/userscripts
// https://developers.google.com/maps/documentation/urls/get-started
// https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html

(() => {
  'use strict';

  function convert(raw, base) {
    let u;
    try {
      u = new URL(raw, base);
    } catch {
      return null;
    }

    const isWeb =
      ['https:', 'http:'].includes(u.protocol) &&
      ['maps.apple.com', 'www.maps.apple.com'].includes(u.hostname);

    const isScheme =
      u.protocol === 'maps:' &&
      (!u.hostname || u.hostname === 'maps.apple.com');

    if (!isWeb && !isScheme) return null;

    // 短縮URLなど、解釈できない形式は変更しない。
    const path = u.pathname.replace(/\/$/, '') || '/';
    if (!['/', '/place', '/search', '/directions'].includes(path)) {
      return null;
    }

    const p = u.searchParams;

    const get = (...keys) => {
      for (const key of keys) {
        const value = p.get(key)?.trim();
        if (value) return value;
      }
      return '';
    };

    // 複数経由地などはそのまま残す。
    for (const key of p.keys()) {
      if (p.getAll(key).length > 1 || /waypoint/i.test(key)) {
        return null;
      }
    }

    const make = (path, values) => {
      const out = new URL('https://www.google.com/maps/' + path);
      out.searchParams.set('api', '1');

      for (const [key, value] of Object.entries(values)) {
        if (value) out.searchParams.set(key, value);
      }

      return out.href;
    };

    // 経路リンク
    const destination = get('daddr', 'destination');

    if (destination) {
      const origin = get('saddr', 'source');
      const mode = get('dirflg', 'mode');

      const modes = {
        d: 'driving',
        w: 'walking',
        r: 'transit',
        driving: 'driving',
        walking: 'walking',
        transit: 'transit',
        cycling: 'bicycling'
      };

      if (mode && !modes[mode]) return null;

      const isCurrent =
        /^(current location|現在地|現在の場所)$/i.test(origin);

      return make('dir/', {
        destination,
        origin: isCurrent ? '' : origin,
        travelmode: modes[mode] || ''
      });
    }

    if (get('saddr', 'source') || path === '/directions') {
      return null;
    }

    // 住所・検索語・座標リンク
    const address = get('address');
    const query = get('q', 'query');
    const coord = get('coordinate', 'll');

    const validCoord =
      /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*,\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*$/.test(coord) &&
      Math.abs(Number(coord.split(',')[0])) <= 90 &&
      Math.abs(Number(coord.split(',')[1])) <= 180;

    if (validCoord && (path === '/place' || p.has('ll') || !query)) {
      return make('search/', { query: coord });
    }

    if (address || query) {
      return make('search/', { query: address || query });
    }

    if (validCoord) {
      return make('search/', { query: coord });
    }

    return null;
  }

  const converted = new WeakSet();

  function rewrite(a) {
    if (!a?.matches?.('a[href], area[href]')) return;

    const next = convert(a.getAttribute('href'), document.baseURI);
    if (!next) return;

    a.setAttribute('href', next);
    converted.add(a);
  }

  function scan(root) {
    rewrite(root);
    root.querySelectorAll?.('a[href], area[href]').forEach(rewrite);
  }

  // 後から追加・変更されたリンクも変換する。
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        rewrite(record.target);
      } else {
        record.addedNodes.forEach(scan);
      }
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href']
  });

  scan(document);

  // タップ直前にも確認する。
  for (const type of ['pointerdown', 'touchstart', 'contextmenu', 'click']) {
    window.addEventListener(type, event => {
      const a = event.composedPath().find(
        node => node?.matches?.('a[href], area[href]')
      );

      if (!a) return;

      rewrite(a);

      // 元のAppleマップを開くページ側のクリック処理を抑止。
      // リンク自体の通常の遷移は維持する。
      if (
        type === 'click' &&
        converted.has(a) &&
        a.href.startsWith('https://www.google.com/maps/')
      ) {
        event.stopImmediatePropagation();
      }
    }, {
      capture: true,
      passive: true
    });
  }

  // AppleマップのページがSafariで開いた場合も転送する。
  const target = convert(location.href, document.baseURI);
  if (target) location.replace(target);
})();