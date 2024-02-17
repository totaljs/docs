exports.icon = 'ti ti-book';
exports.name = '@(Libraries)';
exports.position = 1;
exports.permissions = [{ id: 'libraries', name: 'Libraries' }];

exports.install = function() {

	// Libraries
	ROUTE('API     ?     -libraries                 --> Libraries/list');
	ROUTE('API     ?     -libraries_read/{id}       --> Libraries/read');
	ROUTE('+API    ?     +libraries_save            --> Libraries/save');
	ROUTE('+API    ?     -libraries_clone/{id}      --> Libraries/clone');
	ROUTE('+API    ?     -libraries_remove/{id}     --> Libraries/remove');
	ROUTE('+API    ?     -libraries_groups/{id}     --> Libraries/groups');
	ROUTE('+API    ?     -libraries_reindex         --> Libraries/reindex');

	// Pages
	ROUTE('API     ?     -pages/{libraryid}         --> Pages/list');
	ROUTE('API     ?     -pages_query               --> Pages/query');
	ROUTE('API     ?     -pages_read/{id}           --> Pages/read');
	ROUTE('+API    ?     +pages_clone/{id}  <10s    --> Pages/clone');
	ROUTE('+API    ?     +pages_save                --> Pages/save');
	ROUTE('+API    ?     -pages_remove/{id}         --> Pages/remove');
	ROUTE('+API    ?     -pages_reindex             --> Pages/reindex');

	// Items
	ROUTE('API     ?     -items                    --> Items/query');
	ROUTE('API     ?     -items_read/{id}          --> Items/read');
	ROUTE('+API    ?     +items_save               --> Items/save');
	ROUTE('+API    ?     -items_remove/{id}        --> Items/remove');
	ROUTE('API     ?     -items_search             --> Items/search');

	// Public API
	ROUTE('GET     ?db/  --> Libraries/db');

};
