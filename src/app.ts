import { define, html, useRequestUpdate } from "./wc-toolkit";
import "./app.css";
import kindWords from "./content/kind-words.json";

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const App = () => {

    const requestUpdate = useRequestUpdate();

    let kindWord = kindWords[getRandomInt(0, kindWords.length-1)]

    return html`
        <div>You are ${kindWord}</div>        
        <a @click="${requestUpdate}">🔄</a>
    `
}

define('app-root', App);