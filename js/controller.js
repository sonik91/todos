(function (window) {
	'use strict';

	/**
	 * Function qui permet de faire la liaison entre le {@link Model} et la {@link View}
	 *  
	 * @class
	 * @name Controller
	 * @param {object} model une instance de {@link Model}
	 * @param {object} view une instance de {@link View}
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}

	/**
	 * Charge et initialise la {@link View}
	 * @memberof Controller
	 * @name setView
	 * @param {string} locationHash '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};

	/**
	 * Function qui permet d'afficher toutes les todos enregistrer
	 * @memberof Controller
	 * @function
	 * @name showAll
	 */
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Function qui permet d'afficher seulement les todos active
	 * @memberof Controller
	 * @function
	 * @name showActive
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Function qui permet d'afficher seulement les todos completer
	 * @memberof Controller
	 * @function
	 * @name showCompleted
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Un événement à déclencher chaque fois que vous souhaitez ajouter un élément. Passez simplement à l'événement
	 * objet et il gérera l'insertion DOM et l'enregistrement du nouvel élément.
	 * 
	 * @memberof Controller
	 * @function
	 * @name addItem
	 * @param { String } title le titre de la nouvelle todo
	 */
	Controller.prototype.addItem = function (title) {//erreur 3d a adddItem
		var self = this;

		if (title.trim() === '') {
			return;
		}

		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};

	
	/**
	 * permet de paser une todo en mode edition afin de pouvoir changer sont titre
	 * 
	 * @memberof Controller
	 * @function
	 * @name editItem
	 * @param  {Number} id id de la todo
	 */
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	
	/**
	 * fermet l'edition d'un todo et sauvegarder sont nouveaux titre
	 * 
	 * @memberof Controller
	 * @function
	 * @name editItemSave
	 * @param  { Number } id id de la todo
	 * @param  { String } title titre de la nouvelle todo
	 */
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;

		while (title[0] === " ") {
			title = title.slice(1);
		}

		while (title[title.length-1] === " ") {
			title = title.slice(0, -1);
		}

		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};

	
	/**
	 * annuler l'edit de la todo
	 * 
	 * @memberof Controller
	 * @function
	 * @name editItemCancel
	 * @param  { Number } id id de la todo
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	/**
	 * permet de suprimer un todo de la liste. il suprimera a la fois du rendus et de la sauvegarde
	 *
	 * @memberof Controller
	 * @function
	 * @name removeItem
	 * @param {number} id Id de la todo a suprimer
	 */
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var items;
		self.model.read(function(data) {
			items = data;
		});

		/* boucle inutile
		items.forEach(function(item) {
			if (item.id === id) {
				console.log("Element with ID: " + id + " has been removed.");
			}
		});
		*/

		self.model.remove(id, function () {
			self.view.render('removeItem', id);
		});

		self._filter();
	};

	
	/**
	 * suprime tous les element avec le statut completer
	 * 
	 * @memberof Controller
	 * @function
	 * @name removeCompletedItems
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self._filter();
	};

	/**
	 * met a jour le statut de l'ellement pour le faire passer d'un statut completer à actif ou l'inverse celon sont etat actuelle
	 * actualise le bouton dans le rendus ainsi que la valeur dans le stockage
	 * 
	 * @memberof Controller
	 * @function
	 * @name toggleComplete
	 * @param {number} id Id de l'ellement modifier
	 * @param {object} checkbox la case a cocher pour verifier l'etat du statut
	 * @param {boolean|undefined} silent empeche le reflitrage des ellement à faire
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	
	/**
	 * Va basculer l'état d'activation / désactivation de TOUTES les cases à cocher et l'exhaustivité des modèles.
	 * Passez simplement l'objet événement.
	 * 
	 * @memberof Controller
	 * @function
	 * @name toggleAll
	 * @param  { Object } completed statut finale de tous les ellements 
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});

		self._filter();
	};

	/**
	 * Met à jour les éléments de la page qui changent en fonction du nombre d'element sur la page
	 * 
	 * @memberof Controller
	 * @function
	 * @name _updateCount
	 */
	
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	/**
	 * Re-filtre les éléments de todo, en fonction de l'itinéraire actif.
	 * 
	 * _updateCoun: Met à jour les éléments de la page, qui changent à chaque tâche terminée
	 * 
	 * Si le dernier itinéraire actif n'est pas "All" ou si nous changeons d'itinéraire, nous
	 * recrée les éléments de l'élément todo, en appelant: this.show [All|Active|Completed]
	 * 
	 * @memberof Controller
	 * @function
	 * @name _filter
	 * @param {boolean|undefined} force  force une nouvelle peinture des objets à faire.
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		// Update the elements on the page, which change with each completed todo
		this._updateCount();

		// If the last active route isn't "All", or we're switching routes, we
		// re-create the todo item elements, calling:
		//   this.show[All|Active|Completed]();
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Met simplement à jour les états sélectionnés du navigateur de filtre
	 * 
	 * * Stocker une référence à l'itinéraire actif, 
	 * ce qui nous permet de re-filtrer todo éléments 
	 * car ils sont marqués comme terminés ou incomplets.
	 * 
	 * @memberof Controller
	 * @function
	 * @name _updateFilterState
	 * @param {} currentPage obtion du filtre (all - active - completed)
	 * 
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		// Store a reference to the active route, allowing us to re-filter todo
		// items as they are marked complete or incomplete.
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);