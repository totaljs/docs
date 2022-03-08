NEWSCHEMA('Users', function(schema) {

	schema.define('name', String, true);
	schema.define('login', String, true);
	schema.define('password', String, true);
	schema.define('sa', Boolean);
	schema.define('isdisabled', Boolean);
	schema.define('libraries', '[UID]');
	schema.define('access', '[UID]');

	schema.setQuery(function($) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		NOSQL('users').find().sort('dtcreated').fields('-password').sort('dtcreated_desc').callback($.callback);
	});

	schema.setRead(function($) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		NOSQL('users').one().id($.id).fields('-password').callback($.callback, 'error-users-404');
	});

	schema.setInsert(function($, model) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		model.id = UID();
		model.dtcreated = NOW;
		model.dtupdated = NOW;
		model.password = model.password.sha256(CONF.admin_password);
		NOSQL('users').insert(model).callback($.done(model.id));
	});

	schema.setUpdate(function($, model) {

		if (!$.user.sa) {
			$.invalid(401);
			return;
		}

		model.dtupdated = NOW;
		model.password = model.password.startsWith('**') ? undefined : model.password.sha256(CONF.admin_password);
		NOSQL('users').modify(model).id($.id).callback($.done($.id));
	});

	schema.setRemove(function($) {
		if ($.user.sa)
			NOSQL('users').remove().id($.id).callback($.done($.id));
		else
			$.invalid(401);
	});

});

ON('ready', function() {
	NOSQL('users').count().callback(function(err, response) {
		if (!response.count) {
			// Create a default user
			var pass = GUID(10);
			var user = {};
			user.id = UID();
			user.name = 'Admin';
			user.login = GUID(10);
			user.password = pass.sha256(CONF.admin_password);
			user.sa = true;
			user.isdisabled = false;
			user.dtcreated = NOW;
			user.dtupdated = NOW;
			NOSQL('users').insert(user);
			PREF.set('login', { login: user.login, password: pass });
		}
	});
});