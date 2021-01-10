NEWSCHEMA('Users', function(schema) {

	schema.define('name', String, true);
	schema.define('email', 'Email', true);
	schema.define('password', String, true);
	schema.define('sa', Boolean);
	schema.define('isdisabled', Boolean);
	schema.define('welcome', Boolean);
	schema.define('libraries', '[UID]');

	schema.setQuery(function($) {
		NOSQL('users').find().sort('dtcreated').fields('-password').sort('dtcreated_desc').callback($.callback);
	});

	schema.setRead(function($) {
		NOSQL('users').one().id($.id).fields('-password').callback($.callback, 'error-users-404');
	});

	schema.setInsert(function($, model) {
		model.id = UID16();
		model.dtcreated = NOW;
		model.dtupdated = NOW;
		model.password = model.password.sha256(CONF.admin_password);
		model.welcome = undefined;
		NOSQL('users').insert(model).callback($.done(model.id));
	});

	schema.setUpdate(function($, model) {
		model.welcome = undefined;
		model.dtupdated = NOW;
		model.password = model.password.startsWith('***') ? model.password.sha256(CONF.admin_password) : undefined;
		NOSQL('users').modify(model).id($.id).callback($.done($.id));
	});

	schema.setRemove(function($) {
		NOSQL('users').remove().id($.id).callback($.done($.id));
	});

});
