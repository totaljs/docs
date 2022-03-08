NEWSCHEMA('Profile', function(schema) {

	schema.define('name', 'String(30)', true);
	schema.define('login', 'String(150)', true);
	schema.define('password', 'String(30)');

	schema.setRead(function($) {
		NOSQL('users').one().id($.user.id).fields('name,login,libraries,sa').callback($.callback);
	});

	schema.setSave(function($, model) {

		if (model.password && !model.password.startsWith('**'))
			model.password = model.password.sha256(CONF.admin_password);
		else
			delete model.password;

		$.user.name = model.name;
		NOSQL('users').modify(model).id($.user.id).callback($.done());
	});

});