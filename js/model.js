(function (window) {
	'use strict';

	/**
	 * Crée une nouvelle instance de modèle et connecte le {@link Store}.
	 *
	 * @class
	 * @name Model
	 * @param {object} storage Une référence à la classe de stockage côté client
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Cree un nouveaux Todo model
	 * 
	 * @memberof Model
	 * @function
	 * @name create
	 * @param {string} [title] Le titre de la tâche
	 * @param {function} [callback] Le rappel à déclencher après la création du modèle
	 */
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(),
			completed: false
		};

		this.storage.save(newItem, callback);
	};

	/**
	 * Recherche et renvoie un modèle stocké. Si aucune requête n'est donnée, il sera tout simplement
	 * retourner. Si vous passez une chaîne ou un nombre, cela ressemblera à
	 * l'ID du modèle à trouver. Enfin, vous pouvez lui passer un objet pour correspondre
	 * 
	 * @memberof Model
	 * @function
	 * @name read
	 * @param {string|number|object} [query] Une requête pour faire correspondre les modèles
	 * @param {function} [callback] Le rappel pour déclencher une fois le modèle trouvé
	 *
	 * @example
	 * model.read(1, func); // Trouvera le modèle avec un ID de 1
	 * model.read('1'); // Comme ci-dessus
	 * //Vous trouverez ci-dessous un modèle avec un attribut foo egale à bar et bonjour egale à monde
	 * model.read({ foo: 'bar', hello: 'world' });
	 */
	Model.prototype.read = function (query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	/**
	 * Met à jour un modèle en lui attribuant un ID, des données à mettre à jour et un rappel à déclencher lorsque
	 * la mise à jour est terminée.
	 *
	 * @memberof Model
	 * @function
	 * @name update
	 * @param {number} id Id du modele a modifier
	 * @param {object} data Les propriétés à mettre à jour et leur nouvelle valeur
	 * @param {function} callback Le rappel à déclencher lorsque la mise à jour est terminée.
	 */
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	/**
	 * suprime le model du stokage
	 *
	 * @memberof Model
	 * @function
	 * @name remove
	 * @param {number} id Id du model a suprimer
	 * @param {function} callback 
	 * 
	 * Le rappel à déclencher lorsque la suppression est terminée.
	 */
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	/**
	 * AVERTISSEMENT: supprimera TOUTES les données du stockage.
	 *
	 * @memberof Model
	 * @function
	 * @name removeAll
	 * @param {function} callback 
	 * 
	 * Le rappel à déclencher lorsque le stockage est effacé.
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * renvoie le nombre d'element todo
	 * 
	 * @memberof Model
	 * @function
	 * @name getCount
	 * 
	 */
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
