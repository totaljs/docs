exports.icon = 'ti ti-book';
exports.name = '@(Libraries)';
exports.position = 1;
exports.permissions = [{ id: 'libraries', name: 'Libraries' }];

exports.install = function() {

	// Libraries
	ROUTE('API     /api/     -libraries               *Libraries   --> list');
	ROUTE('API     /api/     -libraries_read/{id}     *Libraries   --> read');
	ROUTE('+API    /api/     +libraries_save          *Libraries   --> save');
	ROUTE('+API    /api/     +libraries_remove/{id}   *Libraries   --> remove');
	ROUTE('+API    /api/     -libraries_groups/{id}   *Libraries   --> groups');
	ROUTE('+API    /api/     +libraries_reindex       *Libraries   --> reindex');

	// Pages
	ROUTE('API     /api/     -pages/{libraryid}       *Pages       --> list');
	ROUTE('API     /api/     -pages_query             *Pages       --> query');
	ROUTE('API     /api/     -pages_read/{id}         *Pages       --> read');
	ROUTE('+API    /api/     +pages_clone/{id}        *Pages       --> clone', [10000]);
	ROUTE('+API    /api/     +pages_save              *Pages       --> save');
	ROUTE('+API    /api/     +pages_remove/{id}       *Pages       --> remove');
	ROUTE('+API    /api/     +pages_reindex           *Pages       --> reindex');

	// Items
	ROUTE('API     /api/     -items                   *Items       --> query');
	ROUTE('API     /api/     +items_read/{id}         *Items       --> read');
	ROUTE('+API    /api/     +items_save              *Items       --> save');
	ROUTE('+API    /api/     +items_remove/{id}       *Items       --> remove');
	ROUTE('API     /api/     -items_search            *Items       --> search');

	// Public API
	ROUTE('GET     /api/db/  *Libraries --> db');

};