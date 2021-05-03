/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Crée un nouvel objet de stockage côté client et crée un objet vide
	 * si aucun n'existe déjà.
	 * 
	 * @name Store
	 * @constructor
	 * @param {string} name Le nom de notre base de données que nous voulons utiliser
	 * @param {function} callback faux appel a une base de doner dans le cas ou l'aplication aurra un stockage en ligne
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Recherche des éléments en fonction d'une requête donnée en tant qu'objet JS
	 *
	 * @memberof Store
	 * @function
	 * @name find
	 * @param {object} query La requête à comparer (i.e. {foo: 'bar'})
	 * @param {function} callback	 Le rappel à déclencher lorsque la requête est terminer
	 * 
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data renvera tous les ellement qui ont foo: bar et
	 *	 // hello: world dans leur proprieter
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Récupérera toutes les données de la collection
	 * 
	 * @memberof Store
	 * @function
	 * @name findAll
	 * @param {function} callback Le rappel à déclencher lors de la récupération des données
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Sauvegardera les données fournies dans la base de données. Si aucun élément n'existe, il créera un nouveau
	 * élément, sinon il mettra simplement à jour les propriétés d'un élément existant
	 *
	 * @memberof Store
	 * @function
	 * @name save
	 * @param {object} updateData Les données à sauvegarder dans la base de données
	 * @param {function} callback la fonction de rapelle apres la sauvegarde
	 * @param {number} id Un paramètre facultatif pour saisir l'ID d'un élément à mettre à jour
	 */
	Store.prototype.save = function (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;

		callback = callback || function () {};

		// If an ID was actually given, find the item and update each property
		if (id) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {

    		// Assign an ID
			//updateData.id = parseInt(newId);
			updateData.id = Date.now();//genere un date stamps pour evité d'avoir deux fois le même id
    

			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Supprime un article du magasin en fonction de son identifiant
	 *
	 * @memberof Store
	 * @function
	 * @name remove
	 * @param {number} id Id de l'ellement a suprimer
	 * @param {function} callback Function de rappele apres la supresion
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var todoId;
		
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todoId = todos[i].id;
			}
		}

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == todoId) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Va abandonner tout le stockage et recommencer à zéro
	 *
	 * @memberof Store
	 * @function
	 * @name drop
	 * @param {function} callback Le rappel à déclencher après la suppression des données
	 */
	Store.prototype.drop = function (callback) {
		var data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);