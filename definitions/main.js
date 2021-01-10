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