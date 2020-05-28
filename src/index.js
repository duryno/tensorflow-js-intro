import _ from 'lodash'
import {Demo} from "./demo";

function component() {
    const element = document.createElement('div');

    new Demo()

    return element;
}

document.body.appendChild(component());