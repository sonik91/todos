/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * ensemble de fonction global
	 * @name Helpers
	 * @global
	 */

	
	/**
	 * retourne un element du dom par selecteur css
	 * 
	 * @name qs
	 * @function
	 * @memberof Helpers
	 * @param  {} selector selecteur css
	 * @param  {} scope element parent si besoin
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	/**
	 * retourne un tableau d'ellement du DOM par selecteur css
	 * @name qsa
	 * @function
	 * @memberof Helpers
	 * @param  {} selector sellecteur css
	 * @param  {} scope element parent si besoin
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * cree un addEventListener
	 * @name $on 
	 * @function
	 * @memberof Helpers
	 * @param  {} target ellement cible
	 * @param  {} type type d'evenement
	 * @param  {} callback fonction a executer
	 * @param  {} useCapture gestion de la propagation
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	/**
	 * fonction de dispatchement d'un evenement a tous les ellement correspondant au selecteur
	 * @name $delegate
	 * @function
	 * @memberof Helpers
	 * @param  {} target ellement qui declenche l'evenement
	 * @param  {} selector selecteur css des elements cible
	 * @param  {} type type de propagation de l'evenement 
	 * @param  {} handler handler
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	/**
	 * fonction qui retourne l'element parent d'un element du dom
	 * @name $parent
	 * @function
	 * @memberof Helpers
	 * @param  {} element element du dom 
	 * @param  {} tagName selecteur css 
	 * @returns { Object } ellement du dom parent
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
