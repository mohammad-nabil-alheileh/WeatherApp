// Small DOM helpers.
export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];

// views: loading | ready | empty | error (CSS reacts to body[data-view])
export const setView = view => { document.body.dataset.view = view; };
