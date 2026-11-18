/* Funciones puras compartidas por la página y las pruebas. */
(function (root) {
  'use strict';
  const normalizar = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function criterios(colegio, filtro) {
    const checks = [];
    if (filtro.gestion) checks.push(colegio.gestion === filtro.gestion);
    if (filtro.nivel) checks.push(colegio.niveles.includes(filtro.nivel));
    return { aciertos: checks.filter(Boolean).length, total: checks.length };
  }
  function seleccionar(colegios, filtro) {
    const texto = normalizar(filtro.texto).trim();
    const list = colegios.filter(c => normalizar([c.nombre,c.sede,c.direccion].join(' ')).includes(texto)).filter(c => {
      if (filtro.orden === 'ranking') return true;
      if (filtro.gestion && c.gestion !== filtro.gestion) return false;
      if (filtro.nivel && !c.niveles.includes(filtro.nivel)) return false;
      return true;
    }).map(c => ({ ...c, coincidencia: criterios(c, filtro) }));
    return list.sort((a,b) => {
      if (filtro.orden === 'ranking' && a.coincidencia.aciertos !== b.coincidencia.aciertos) return b.coincidencia.aciertos - a.coincidencia.aciertos;
      return (a.nombre + a.sede).localeCompare(b.nombre + b.sede, 'es');
    });
  }
  function enlaceSeguro(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  }
  function imagenSegura(value) {
    if (typeof value !== 'string') return '';
    const local = /^\.\/img\/[a-zA-Z0-9_./-]+\.(svg|png|webp|jpe?g)$/i.test(value) && !value.includes('..');
    return local ? value : enlaceSeguro(value);
  }
  const api = { normalizar, seleccionar, criterios, enlaceSeguro, imagenSegura };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ColegiosCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
