/*global app, $on */
(function () {
	'use strict';

	/**
	 * Fonction principale qui contient toutes l'aplication todo.
	 * @class
	 * @name Todo
	 * @param {string} name Le nom de la nouvelle todo liste.
	 */
	function Todo(name) {
		
		/**
		 * une instance de la class {@link Store}
		 * @memberof Todo
		 * @function
		 * @name storage
		 * @param  {String} name nom de la todo liste
		 */
		this.storage = new app.Store(name);
		/**
		 * une instance de la class {@link Model}
		 * @memberof Todo
		 * @function
		 * @name model
		 * @param  {} this.storage l'instance de storage cree pour cette todo
		 */
		this.model = new app.Model(this.storage);
		/**
		 * une instance de la class {@link Template}
		 * @memberof Todo
		 * @function
		 * @name template
		 */
		this.template = new app.Template();
		/**
		 * une instance de la class {@link View}
		 * @memberof Todo
		 * @function
		 * @name view
		 * @param  {} this.template une instance de {@link template}
		 */
		this.view = new app.View(this.template);
		/**
		 * une instance de la class {@link Controller}
		 * @memberof Todo
		 * @function
		 * @name controller
		 * @param  {} this.model une instance de {@link model}
		 * @param  {} this.view une instance de {@link view}
		 */
		this.controller = new app.Controller(this.model, this.view);
	}

	var todo = new Todo('todos-vanillajs');

	function setView() {
		todo.controller.setView(document.location.hash);
	}
	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
})();
