MAIN.version = 1;
MAIN.session = SESSION();

MAIN.session.ondata = function(meta, next) {
	NOSQL('users').read().fields('-password').where('isdisabled', false).id(meta.id).callback(next);
};

AUTH(function($) {
	var opt = {};
	opt.name = CONF.admin_cookie;
	opt.key = CONF.admin_secret;
	opt.expire = '1 month';
	MAIN.session.getcookie($, opt, $.done());
});

FUNC.refresh_private = function() {

	MAIN.private = {};

	NOSQL('db').find().where('kind', 'library').where('private', true).fields('id').callback(function(err, response) {
		for (var item of response)
			MAIN.private[item.id] = 1;
	});

	NOSQL('users').count().callback(function(err, response) {
		if (!response.count) {
			// create new
			EXEC('+Users --> insert', { name: 'Admin', email: 'info@totaljs.com',  password: '123456', sa: true }, ERROR('admin'));
		}
	});


};

ON('ready', FUNC.refresh_private);