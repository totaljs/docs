COMPONENT('items', 'lnew:new;lchangelog:Changelog;ldeprecated:Deprecated;lcreated:Created;lupdated:Updated;lproperties:Properties;lmethods:Methods;lcommands:Commands;levents:Events;ldelegates:Delegates;lendpoints:Endpoints;lfaq:FAQ;ltopics:Topics;lhelp:Tips and tricks;lglossary:Glossary', function(self, config, cls) {

	var cls2 = '.' + cls;
	var skiphash = false;

	var moveto = function(id) {
		var el = self.find('.ui-items-topic[data-id="{0}"]'.format(id));
		if (el.length) {
			if (!el.hclass('selected'))
				el.find('label').trigger('click');
			el.closest('.ui-scrollbar-area').scrollTop(el.offset().top - 50);
		}
	};

	$(W).on('hashchange', function() {

		if (skiphash) {
			skiphash = false;
			return;
		}

		var hash = location.hash.substring(1);
		if (hash)
			setTimeout2(self.ID + 'hash', moveto, 100, null, hash);
	});

	self.make = function() {

		self.event('click', 'a', function(e) {
			var url = $(this).attr('href');
			if (url.charAt(0) === '#') {
				setTimeout2(self.ID + 'hash', moveto, 100, null, url.substring(1));
			} else if (url.charAt(0) === '/') {
				e.preventDefault();
				REDIRECT(url);
			}
		});

		self.event('click', 'label', function() {
			var el = $(this);
			var topic = el.closest(cls2 + '-topic');
			if (topic.length) {
				var id = topic.attrd('id');
				var item = self.get().findItem('id', id);
				var icon = topic.find('label').find('i');
				var content = topic.find(cls2 + '-content');
				if (content.length) {
					content.tclass('hidden');
					topic.tclass('selected');
					skiphash = true;
					location.hash = topic.hclass('selected') ? id : '';
				} else {
					var changelog = item.changelog ? '<div class="{0}-changelog"><b>{2}:</b>{1}</div>'.format(cls, item.changelog.markdown({ wrap: false, images: false, links: false, br: false, headlines: false, tables: false, hr: false, sections: false, blockquotes: false, footnotes: false, linetag: 'div' }), config.lchangelog) : '';
					var meta = '<dl>';

					meta += '<dt>{2}</dt><dd>{0} by <b>{1}</b></dd>'.format(item.dtcreated.format(), item.creator, config.lcreated);

					if (item.updater)
						meta += '<dt>{2}</dt><dd>{0} by <b>{1}</b></dd>'.format(item.dtupdated.format(), item.updater, config.lupdated);

					meta += '</dl>';

					topic.append('<div class="{0}-content markdown-small">{1}{2}{3}<div class="{0}-meta">{4}</div></div>'.format(cls, item.deprecated ? '<div class="{0}-deprecated-badge"><i class="fa fa-warning mr5"></i>{1}</div>'.format(cls, config.ldeprecated) : '', changelog, item.body.markdown(), meta));
					topic.aclass('selected');
					icon.attrd('class', icon.attr('class'));
					skiphash = true;
					location.hash = id;
					FUNC.markdownredraw(topic);
				}

				var sel = 'fa fa-angle-down';

				if (content.hclass('hidden'))
					icon.rclass(sel).aclass(icon.attrd('class'));
				else
					icon.rclass().aclass(sel);
			}
		});

		self.event('click', cls2 + '-edit', function() {
			var el = $(this);
			EXEC(self.makepath(config.edit), el, el.attrd('id'));
		});

		self.event('contextmenu', cls2 + '-text,' + cls2 + '-topic', function(e) {

			if (!W.user)
				return;

			var el = $(this);

			if (el.hclass(cls + '-text'))
				el = $(el[0].children[0]);

			e.preventDefault();
			EXEC(self.makepath(config.edit), el, el.attrd('id'), e);
		});
	};

	self.setter = function(value) {

		if (!value) {
			self.empty();
			return;
		}

		var types = {};
		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			if (types[item.type])
				types[item.type].push(item);
			else
				types[item.type] = [item];
		}

		var builder = [];
		var topics = [];
		var topiclist = [];
		var bottom = [];

		if (types.text) {
			types.text.quicksort('dtcreated');

			var tmp = [];

			for (var i = 0; i < types.text.length; i++) {
				var item = types.text[i];
				var md = '<div class="{0}-text"><span data-id="{2}" class="{0}-edit"><i class="far fa-pencil"></i></span><div class="{0}-content">{1}</div></div>'.format(cls, item.body.markdown(), item.id);
				if (item.bottom)
					bottom.push(md);
				else
					tmp.push(md);
			}

			if (tmp.length) {
				builder.push('<div>');
				builder.push.apply(builder, tmp);
				builder.push('</div>');
			}
		}

		var maketopics = function(type, arr) {


			var plus = '';
			topics.push('<div class="{0}-topics {0}-{1}">'.format(cls, type));

			switch (type) {
				case 'property':
					type = config.lproperties;
					plus += ';';
					break;
				case 'method':
					type = config.lmethods;
					plus += ';';
					break;
				case 'command':
					type = config.lcommands;
					break;
				case 'event':
					type = config.levents;
					plus += ';';
					break;
				case 'delegate':
					type = config.ldelegates;
					plus += ';';
					break;
				case 'rest':
					type = config.lendpoints;
					break;
				case 'help':
					type = config.lhelp;
					break;
				case 'glossary':
					type = config.lglossary;
					break;
				case 'faq':
					type = config.lfaq;
					break;
			}

			var typeslug = type.slug();
			topiclist.push('<li><a href="#{0}">{1}</a></li>'.format(typeslug, type));
			topics.push('<h2 id="{0}">{1}</h2>'.format(typeslug, type));

			for (var i = 0; i < arr.length; i++) {
				var item = arr[i];
				var name = item.name.encode();
				var icon = item.icon || 'fa fa-angle-right';
				var version = item.version ? '<span>{0}</span>'.format(((/^\+v/).test(item.version) ? '' : '+v') + item.version.encode()) : '';
				var newbie = item.newbie ? '<b>{0}</b>'.format(config.lnew) : '';
				var deprecated = item.deprecated ? ' {0}-deprecated'.format(cls) : '';

				if (plus && name.charAt(name.length - 1) !== ';')
					name += plus;

				if (item.deprecated)
					name = name + '<strong class="badge badge-silver badge-small ml5">{0}</strong>'.format(config.ldeprecated);

				topics.push('<div class="{0}-topic{7}" data-id="{1}"><span data-id="{1}" class="{0}-edit"><i class="far fa-pencil"></i></span>{8}<label{4}>{5}<i class="{3}"></i>{2}{6}</label></div>'.format(cls, item.id, name, icon, item.color ? ' style="color:{0}"'.format(item.color) : '', version, newbie, deprecated, (item.note ? '<em>{0}</em>'.format(item.note) : '')));
			}

			topics.push('</div>');
		};

		if (types.glossary)
			maketopics('glossary', types.glossary);

		if (types.help)
			maketopics('help', types.help);

		if (types.property)
			maketopics('property', types.property);

		if (types.delegate)
			maketopics('delegate', types.delegate);

		if (types.method)
			maketopics('method', types.method);

		if (types.event)
			maketopics('event', types.event);

		if (types.command)
			maketopics('command', types.command);

		if (types.rest)
			maketopics('rest', types.rest);

		if (types.faq)
			maketopics('faq', types.faq);

		if (topics.length)
			builder.push(topics.join(''));

		if (bottom.length) {
			builder.push('<div class="{0}-bottom">'.format(cls));
			builder.push.apply(builder, bottom);
			builder.push('</div>');
		}

		if (topiclist.length && (types.text || topiclist.length > 1))
			builder.unshift('<div class="{0}-topiclist"><div><i class="fa fa-bookmark"></i>{2}</div><ul>{1}</ul></div>'.format(cls, topiclist.join('\n'), config.ltopics));

		delete types.text;

		self.html(builder.join(''));
		FUNC.markdownredraw(self.element);
	};
});

COMPONENT('nav', function(self, config, cls) {

	var prev;

	self.make = function() {
		self.aclass(cls);
		self.datasource(config.datasource, self.redraw);
		self.event('click', 'span', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var el = $(this);
			config.edit && EXEC(self.makepath(config.edit), el, el.closest('li').attrd('id'));
		});

	};

	self.redraw = function(path, value) {

		if (!value)
			return;

		var groups = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];

			if (!item.group)
				item.group = '$';

			if (groups[item.group])
				groups[item.group].push(item);
			else
				groups[item.group] = [item];
		}

		var render = function(group, items) {
			if (group !== '$')
				builder.push('<div class="group">{0}</div>'.format(group));
			items.quicksort('sortindex');
			builder.push('<ul>');
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var icon = item.icon ? ('<i class="{0}"{1}></i>').format(item.icon, item.color ? (' style="color:' + item.color + '"') : '') : '';
				builder.push(('<li data-id="{2}"' + (item.deprecated ? ' class="deprecated"' : '') + '><a href="{0}" class="jR" draggable="true"><span><i class="far fa-pencil"></i></span>{3}{5}{1}{4}</a></li>').format(item.url, item.name.encode(), item.id, icon, item.newbie ? '<b>new</b>' : '', item.version ? '<em>{0}</em>'.format(item.version.encode()) : ''));
			}
			builder.push('</ul>');
		};

		var builder = [];
		if (groups.$) {
			render('$', groups.$);
			delete groups.$;
		}

		var keys = Object.keys(groups);
		keys.quicksort();
		for (var i = 0; i < keys.length; i++) {
			groups[keys[i]].quicksort('name');
			render(keys[i], groups[keys[i]]);
		}

		self.html(builder.join(''));
	};

	self.setter = function(value) {
		prev && prev.rclass('selected');
		if (value)
			prev = self.find('li[data-id="{0}"]'.format(value)).aclass('selected');
	};

});

COMPONENT('importer', function(self, config) {

	var init = false;
	var clid = null;
	var pending = false;
	var content = '';

	self.readonly();

	self.make = function() {
		var scr = self.find('script');
		content = scr.length ? scr.html() : '';
	};

	self.reload = function(recompile) {
		config.reload && EXEC(config.reload);
		recompile && COMPILE();
		setTimeout(function() {
			pending = false;
			init = true;
		}, 1000);
	};

	self.setter = function(value) {

		if (pending)
			return;

		if (config.if !== value) {
			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);
			return;
		}

		pending = true;

		if (clid) {
			clearTimeout(clid);
			clid = null;
		}

		if (init) {
			self.reload();
			return;
		}

		if (content) {
			self.html(content);
			setTimeout(self.reload, 50, true);
		} else
			self.import(config.url, self.reload);
	};

	self.clean = function() {
		config.clean && EXEC(config.clean);
		setTimeout(function() {
			self.empty();
			init = false;
			clid = null;
		}, 1000);
	};
});

COMPONENT('viewbox', 'margin:0;scroll:true;delay:100;scrollbar:0;visibleY:1;height:100;invisible:1', function(self, config) {

	var eld, elb;
	var scrollbar;
	var cls = 'ui-viewbox';
	var cls2 = '.' + cls;
	var init = false;

	self.readonly();

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);

		var resize = function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'viewbox' && com.dom.offsetParent && com.$ready && !com.$removed)
					com.resize();
			}
		};

		obj.on('resize', function() {
			setTimeout2('viewboxresize', resize, 200);
		});
	};

	self.destroy = function() {
		scrollbar && scrollbar.destroy();
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'disabled':
				eld.tclass('hidden', !value);
				break;
			case 'minheight':
			case 'margin':
			case 'marginxs':
			case 'marginsm':
			case 'marginmd':
			case 'marginlg':
				!init && self.resize();
				break;
			case 'selector': // backward compatibility
				config.parent = value;
				self.resize();
				break;
		}
	};

	self.scrollbottom = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (elb[0].scrollHeight - self.dom.clientHeight) - (val || 0);
		return elb[0].scrollTop;
	};

	self.scrolltop = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (val || 0);
		return elb[0].scrollTop;
	};

	self.make = function() {
		if (config.invisible)
			self.aclass('invisible');
		config.scroll && MAIN.version > 17 && self.element.wrapInner('<div class="ui-viewbox-body"></div>');
		self.element.prepend('<div class="ui-viewbox-disabled hidden"></div>');
		eld = self.find('> .{0}-disabled'.format(cls)).eq(0);
		elb = self.find('> .{0}-body'.format(cls)).eq(0);
		self.aclass('{0} {0}-hidden'.format(cls));
		if (config.scroll) {
			if (config.scrollbar) {
				if (MAIN.version > 17) {
					scrollbar = W.SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, visibleX: config.visibleX, orientation: config.visibleX ? null : 'y', parent: self.element });
					self.scrolltop = scrollbar.scrollTop;
					self.scrollbottom = scrollbar.scrollBottom;
				} else
					self.aclass(cls + '-scroll');
			} else {
				self.aclass(cls + '-scroll');
				self.find(cls2 + '-body').aclass('noscrollbar');
			}
		}
		self.resize();
	};

	self.released = function(is) {
		!is && self.resize();
	};

	var css = {};

	self.resize = function(scrolltop) {

		if (self.release())
			return;

		var el = self.parent(config.parent);
		var h = el.height();
		var w = el.width();
		var width = WIDTH();
		var margin = config.margin;
		var responsivemargin = config['margin' + width];

		if (responsivemargin != null)
			margin = responsivemargin;

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		h = ((h / 100) * config.height) - margin;

		if (config.minheight && h < config.minheight)
			h = config.minheight;

		css.height = h;
		css.width = self.element.width();
		eld.css(css);

		css.width = null;
		self.css(css);
		elb.length && elb.css(css);
		self.element.SETTER('*', 'resize');
		var c = cls + '-hidden';
		self.hclass(c) && self.rclass(c, 100);
		scrollbar && scrollbar.resize();
		scrolltop && self.scrolltop(0);

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}
	};

	self.resizescrollbar = function() {
		scrollbar && scrollbar.resize();
	};

	self.setter = function() {
		setTimeout(self.resize, config.delay, config.scrolltop);
	};
});

COMPONENT('backtotop', function(self) {

	var height = 0;
	var visible = false;

	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		var $w = $(window);

		self.aclass('ui-backtotop');
		self.html('<a href="javascript:void(0)"><i class="fa fa-arrow-circle-up"></i></a>');

		self.event('click', function() {
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
		});

		height = $w.height();

		$w.on('resize', function() {
			height = $w.height();
		});

		$w.on('scroll', function() {
			setTimeout2(self.id, function() {
				var position = $w.scrollTop();
				if (position > height) {
					if (visible)
						return;
					visible = true;
				} else {
					if (!visible)
						return;
					visible = false;
				}
				self.tclass('active', visible);
			}, 200);
		});
	};
});

COMPONENT('markdown', function (self) {

	self.readonly();
	self.singleton();
	self.blind();
	self.nocompile();

	self.make = function() {
		// Remove from DOM because Markdown is used as a String prototype and Tangular helper
		setTimeout(function() {
			self.remove();
		}, 500);

		$(document).on('click', '.markdown-showsecret,.markdown-showblock', function() {
			var el = $(this);
			var next = el.next();
			next.tclass('hidden');
			var is = next.hclass('hidden');
			var icons = el.find('i');
			if (el.hclass('markdown-showsecret')) {
				icons.eq(0).tclass('fa-unlock', !is).tclass('fa-lock', is);
				icons.eq(1).tclass('fa-angle-up', !is).tclass('fa-angle-down', is);
			} else {
				icons.eq(0).tclass('fa-minus', !is).tclass('fa-plus', is);
				el.tclass('markdown-showblock-visible', !is);
			}
			el.find('b').html(el.attrd(is ? 'show' : 'hide'));
		});
	};

	(function Markdown() {

		var keywords = /(^|\s)\{.*?\}\(.*?\)/g;
		var linksexternal = /(https|http):\/\//;
		var format = /__.*?__|_.*?_|\*\*.*?\*\*|\*.*?\*|~~.*?~~|~.*?~/g;
		var ordered = /^[a-z|0-9]{1}\.\s|^-\s/i;
		var orderedsize = /^(\s|\t)+/;
		var code = /`.*?`/g;
		var encodetags = /<|>/g;
		var regdash = /-{2,}/g;
		var regicons = /(^|[^\w]):((fab\s|far\s|fas\s|fal\s|fad|fa\s)fa-)?[a-z-]+:([^\w]|$)/g;
		var regemptychar = /\s|\W/;
		var regtags = /<[^>]*>/g;

		var encode = function(val) {
			return '&' + (val === '<' ? 'lt' : 'gt') + ';';
		};

		function markdown_code(value) {
			return '<code>' + value.substring(1, value.length - 1) + '</code>';
		}

		function markdown_imagelinks(value) {
			var end = value.lastIndexOf(')') + 1;
			var img = value.substring(0, end);
			var url = value.substring(end + 2, value.length - 1);
			var label = markdown_links(img);
			var footnote = label.substring(0, 13);

			if (footnote === '<sup data-id=' || footnote === '<span data-id' || label.substring(0, 9) === '<a href="')
				return label;

			return '<a href="' + url + '"' + (linksexternal.test(url) ? ' target="_blank"' : '') + '>' + label + '</a>';
		}

		function markdown_table(value, align, ishead) {

			var columns = value.substring(1, value.length - 1).split('|');
			var builder = '';

			for (var i = 0; i < columns.length; i++) {
				var column = columns[i].trim();
				if (column.charAt(0) == '-')
					continue;
				var a = align[i];
				builder += '<' + (ishead ? 'th' : 'td') + (a && a !== 'left' ? (' class="' + a + '"') : '') + '>' + column + '</' + (ishead ? 'th' : 'td') + '>';
			}

			return '<tr>' + builder + '</tr>';
		}

		function markdown_links(value) {
			var end = value.lastIndexOf(']');
			var img = value.charAt(0) === '!';
			var text = value.substring(img ? 2 : 1, end);
			var link = value.substring(end + 2, value.length - 1);

			// footnotes
			if ((/^#\d+$/).test(link)) {
				return (/^\d+$/).test(text) ? '<sup data-id="{0}" class="markdown-footnote">{1}</sup>'.format(link.substring(1), text) : '<span data-id="{0}" class="markdown-footnote">{1}</span>'.format(link.substring(1), text);
			}

			if (link.substring(0, 4) === 'www.')
				link = 'https://' + link;

			var nofollow = link.charAt(0) === '@' ? ' rel="nofollow"' : linksexternal.test(link) ? ' target="_blank"' : '';
			return '<a href="' + link + '"' + nofollow + '>' + text + '</a>';
		}

		function markdown_image(value) {

			var end = value.lastIndexOf(']');
			var text = value.substring(2, end);
			var link = value.substring(end + 2, value.length - 1);
			var responsive = 1;
			var f = text.charAt(0);

			if (f === '+') {
				responsive = 2;
				text = text.substring(1);
			} else if (f === '-') {
				// gallery
				responsive = 3;
				text = text.substring(1);
			}

			return '<img src="' + link + '" alt="' + text + '"' + (responsive === 1 ? ' class="img-responsive"' : responsive === 3 ? ' class="markdown-gallery"' : '') + ' border="0" loading="lazy" />';
		}

		function markdown_keywords(value) {

			var plus = value.charAt(0);
			var f = 2;

			if (plus === '{') {
				f = 1;
				plus = '';
			}

			var keyword = value.substring(f, value.indexOf('}'));
			var type = value.substring(value.lastIndexOf('(') + 1, value.lastIndexOf(')'));
			return plus + '<span class="markdown-keyword" data-type="{0}">{1}</span>'.format(type, keyword);
		}

		function markdown_links2(value) {
			value = value.substring(4, value.length - 4);
			return '<a href="' + (value.isEmail() ? 'mailto:' : linksexternal.test(value) ? '' : 'http://') + value + '" target="_blank">' + value + '</a>';
		}

		function markdown_format(value, index, text) {

			var p = text.charAt(index - 1);
			var n = text.charAt(index + value.length);

			if ((!p || regemptychar.test(p)) && (!n || regemptychar.test(n))) {

				var beg = '';
				var end = '';
				var tag;

				if (value.indexOf('*') !== -1) {
					tag = value.indexOf('**') === -1 ? 'em' : 'strong';
					beg += '<' + tag + '>';
					end = '</' + tag + '>' + end;
				}

				if (value.indexOf('_') !== -1) {
					tag = value.indexOf('__') === -1 ? 'u' : 'b';
					beg += '<' + tag + '>';
					end = '</' + tag + '>' + end;
				}

				if (value.indexOf('~') !== -1) {
					beg += '<strike>';
					end = '</strike>' + end;
				}

				var count = value.charAt(1) === value.charAt(0) ? 2 : 1;
				return beg + value.substring(count, value.length - count) + end;
			}

			return value;
		}

		function markdown_id(value) {
			value = value.replace(regtags, '');
			return value.slug().replace(regdash, '-');
		}

		function markdown_icon(value) {

			var beg = -1;
			var end = -1;

			for (var i = 0; i < value.length; i++) {
				var code = value.charCodeAt(i);
				if (code === 58) {
					if (beg === -1)
						beg = i + 1;
					else
						end = i;
				}
			}

			var icon = value.substring(beg, end);
			if (icon.indexOf(' ') === -1)
				icon = 'fa fa-' + icon;
			return value.substring(0, beg - 1) + '<i class="' + icon + '"></i>' + value.substring(end + 1);
		}

		function markdown_urlify(str) {
			return str.replace(/(^|\s)+(((https?:\/\/)|(www\.))[^\s]+)/g, function(url, b, c) {
				var len = url.length;
				var l = url.charAt(len - 1);
				var f = url.charAt(0);
				if (l === '.' || l === ',')
					url = url.substring(0, len - 1);
				else
					l = '';
				url = (c === 'www.' ? 'http://' + url : url).trim();
				return (f.charCodeAt(0) < 40 ? f : '') + '[' + url + '](' + url + ')' + l;
			});
		}

		FUNC.markdownredraw = function(el, opt) {

			if (!el)
				el = $('body');

			if (!opt)
				opt = EMPTYOBJECT;

			el.find('.lang-secret').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				el.parent().replaceWith('<div class="markdown-secret" data-show="{0}" data-hide="{1}"><span class="markdown-showsecret"><i class="fa fa-lock"></i><i class="fa pull-right fa-angle-down"></i><b>{0}</b></span><div class="hidden">'.format(opt.showsecret || 'Show secret data', opt.hidesecret || 'Hide secret data') + el.html().trim().markdown(opt.secretoptions, true) +'</div></div>');
			});

			el.find('.lang-video').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				var html = el.html();
				if (html.indexOf('youtube') !== -1)
					el.parent().replaceWith('<div class="markdown-video"><iframe src="https://www.youtube.com/embed/' + html.split('v=')[1] + '" frameborder="0" allowfullscreen></iframe></div>');
				else if (html.indexOf('vimeo') !== -1)
					el.parent().replaceWith('<div class="markdown-video"><iframe src="//player.vimeo.com/video/' + html.substring(html.lastIndexOf('/') + 1) + '" frameborder="0" allowfullscreen></iframe></div>');
			});

			el.find('.lang-barchart').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;

				t.$mdloaded = 1;
				var el = $(t);
				var arr = el.html().split('\n').trim();
				var series = [];
				var categories = [];
				var y = '';

				for (var i = 0; i < arr.length; i++) {
					var line = arr[i].split('|').trim();
					for (var j = 1; j < line.length; j++) {
						if (i === 0)
							series.push({ name: line[j], data: [] });
						else
							series[j - 1].data.push(+line[j]);
					}
					if (i)
						categories.push(line[0]);
					else
						y = line[0];
				}

				var options = {
					chart: {
						height: 300,
						type: 'bar',
					},
					yaxis: { title: { text: y }},
					series: series,
					xaxis: { categories: categories, },
					fill: { opacity: 1 },
				};

				var chart = new ApexCharts($(this).parent().empty()[0], options);
				chart.render();
			});

			el.find('.lang-linerchart').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;

				var el = $(t);
				var arr = el.html().split('\n').trim();
				var series = [];
				var categories = [];
				var y = '';

				for (var i = 0; i < arr.length; i++) {
					var line = arr[i].split('|').trim();
					for (var j = 1; j < line.length; j++) {
						if (i === 0)
							series.push({ name: line[j], data: [] });
						else
							series[j - 1].data.push(+line[j]);
					}
					if (i)
						categories.push(line[0]);
					else
						y = line[0];
				}

				var options = {
					chart: {
						height: 300,
						type: 'line',
					},
					yaxis: { title: { text: y }},
					series: series,
					xaxis: { categories: categories, },
					fill: { opacity: 1 },
				};

				var chart = new ApexCharts($(this).parent().empty()[0], options);
				chart.render();
			});

			el.find('.lang-iframe').each(function() {

				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;

				var el = $(t);
				el.parent().replaceWith('<div class="markdown-iframe">' + el.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>') + '</div>');
			});

			el.find('pre code').each(function(i, block) {
				var t = this;
				if (t.$mdloaded)
					return;
				if (W.hljs) {
					t.$mdloaded = 1;
					W.hljs.highlightBlock(block);
					$(t).parent().parent().append('<div class="help"><span class="link exec" data-exec="common/copytoclipboard"><i class="far fa-copy"></i>{0}</span></div>'.format('Copy to clipboard'));
				}
			});

			el.find('a').each(function() {
				var t = this;
				if (t.$mdloaded)
					return;
				t.$mdloaded = 1;
				var el = $(t);
				var href = el.attr('href');
				var c = href.substring(0, 1);
				if (href === '#') {
					var beg = '';
					var end = '';
					var text = el.html();
					if (text.substring(0, 1) === '<')
						beg = '-';
					if (text.substring(text.length - 1) === '>')
						end = '-';
					el.attr('href', '#' + (beg + markdown_id(el.text()) + end));
				} else if (c !== '/' && c !== '#')
					el.attr('target', '_blank');
			});

			el.find('.markdown-code').rclass('hidden');
		};

		String.prototype.markdown = function(opt, nested) {

			// opt.wrap = true;
			// opt.linetag = 'p';
			// opt.ul = true;
			// opt.code = true;
			// opt.images = true;
			// opt.links = true;
			// opt.formatting = true;
			// opt.icons = true;
			// opt.tables = true;
			// opt.br = true;
			// opt.headlines = true;
			// opt.hr = true;
			// opt.blockquotes = true;
			// opt.sections = true;
			// opt.custom
			// opt.footnotes = true;
			// opt.urlify = true;
			// opt.keywords = true;
			// opt.emptynewline = true;

			var str = this;

			if (!opt)
				opt = {};

			var lines = str.split('\n');
			var builder = [];
			var ul = [];
			var table = false;
			var iscode = false;
			var isblock = false;
			var ishead = false;
			var isprevblock = false;
			var prev;
			var prevsize = 0;
			var previndex;
			var tmp;

			if (opt.wrap == null)
				opt.wrap = true;

			if (opt.linetag == null)
				opt.linetag = 'p';

			var closeul = function() {
				while (ul.length) {
					var text = ul.pop();
					builder.push('</' + text + '>');
				}
			};

			var formatlinks = function(val) {
				return markdown_links(val, opt.images);
			};

			var linkscope = function(val, index, callback) {

				var beg = -1;
				var beg2 = -1;
				var can = false;
				var skip = false;
				var find = false;
				var n;

				for (var i = index; i < val.length; i++) {
					var c = val.charAt(i);

					if (c === '[') {
						beg = i;
						can = false;
						find = true;
						continue;
					}

					var codescope = val.substring(i, i + 6);

					if (skip && codescope === '</code') {
						skip = false;
						i += 7;
						continue;
					}

					if (skip)
						continue;

					if (!find && codescope === '<code>') {
						skip = true;
						continue;
					}

					var il = val.substring(i, i + 4);

					if (il === '&lt;') {
						beg2 = i;
						continue;
					} else if (beg2 > -1 && il === '&gt;') {
						callback(val.substring(beg2, i + 4), true);
						beg2 = -1;
						continue;
					}

					if (c === ']') {

						can = false;
						find = false;

						if (beg === -1)
							continue;

						n = val.charAt(i + 1);

						// maybe a link mistake
						if (n === ' ')
							n = val.charAt(i + 2);

						// maybe a link
						can = n === '(';
					}

					if (beg > -1 && can && c === ')') {
						n = val.charAt(beg - 1);
						callback(val.substring(beg - (n === '!' ? 1 : 0), i + 1));
						can = false;
						find = false;
						beg = -1;
					}
				}

			};

			var formatline = function(line) {
				var tmp = [];
				return line.replace(code, function(text) {
					tmp.push(text);
					return '\0';
				}).replace(format, markdown_format).replace(/\0/g, function() {
					return markdown_code(tmp.shift());
				});
			};

			var imagescope = function(val) {

				var beg = -1;
				var can = false;
				var n;

				for (var i = 0; i < val.length; i++) {
					var c = val.charAt(i);

					if (c === '[') {
						beg = i;
						can = false;
						continue;
					}

					if (c === ']') {

						can = false;

						if (beg === -1)
							continue;

						n = val.charAt(i + 1);

						// maybe a link mistake
						if (n === ' ')
							n = val.charAt(i + 2);

						// maybe a link
						can = n === '(';
					}

					if (beg > -1 && can && c === ')') {
						n = val.charAt(beg - 1);
						var tmp = val.substring(beg - (n === '!' ? 1 : 0), i + 1);
						if (tmp.charAt(0) === '!')
							val = val.replace(tmp, markdown_image(tmp));
						can = false;
						beg = -1;
					}
				}


				return val;
			};

			for (var i = 0; i < lines.length; i++) {

				lines[i] = lines[i].replace(encodetags, encode);
				var three = lines[i].substring(0, 3);

				if (!iscode && (three === ':::' || (three === '==='))) {

					if (isblock) {
						if (opt.blocks !== false)
							builder[builder.length - 1] += '</div></div>';
						isblock = false;
						isprevblock = true;
						continue;
					}

					closeul();
					isblock = true;
					if (opt.blocks !== false) {
						line = lines[i].substring(3).trim();
						if (opt.formatting !== false)
							line = formatline(line);
						builder.push('<div class="markdown-block"><span class="markdown-showblock"><i class="fa fa-plus"></i>{0}</span><div class="hidden">'.format(line));
					}
					prev = '';
					continue;
				}

				if (!isblock && lines[i] && isprevblock) {
					builder.push('<br />');
					isprevblock = false;
				}

				if (three === '```') {

					if (iscode) {
						if (opt.code !== false)
							builder[builder.length - 1] += '</code></pre></div>';
						iscode = false;
						continue;
					}

					closeul();
					iscode = true;
					if (opt.code !== false)
						tmp = '<div class="markdown-code hidden"><pre><code class="lang-' + lines[i].substring(3) + '">';
					prev = 'code';
					continue;
				}

				if (iscode) {
					if (opt.code !== false)
						builder.push(tmp + lines[i]);
					if (tmp)
						tmp = '';
					continue;
				}

				var line = lines[i];

				if (opt.br !== false)
					line = line.replace(/&lt;br(\s\/)?&gt;/g, '<br />');

				if (line.length > 10 && opt.urlify !== false && opt.links !== false)
					line = markdown_urlify(line);

				if (opt.custom)
					line = opt.custom(line);

				if (line.length > 2 && line !== '***' && line !== '---') {
					if (opt.formatting !== false)
						line = formatline(line);
					if (opt.images !== false)
						line = imagescope(line);
					if (opt.links !== false) {
						linkscope(line, 0, function(text, inline) {
							if (inline)
								line = line.replace(text, markdown_links2);
							else if (opt.images !== false)
								line = line.replace(text, markdown_imagelinks);
							else
								line = line.replace(text, formatlinks);
						});
					}
					if (opt.keywords !== false)
						line = line.replace(keywords, markdown_keywords);

					if (opt.icons !== false)
						line = line.replace(regicons, markdown_icon);
				}

				if (!line) {
					if (table) {
						table = null;
						if (opt.tables !== false)
							builder.push('</tbody></table>');
					}
				}

				if (line === '' && lines[i - 1] === '') {
					closeul();
					if (opt.emptynewline !== false)
						builder.push('<br />');
					prev = 'br';
					continue;
				}

				if (line[0] === '|') {
					closeul();
					if (!table) {
						var next = lines[i + 1];
						if (next[0] === '|') {
							table = [];
							var columns = next.substring(1, next.length - 1).split('|');
							for (var j = 0; j < columns.length; j++) {
								var column = columns[j].trim();
								var align = 'left';
								if (column.charAt(column.length - 1) === ':')
									align = column[0] === ':' ? 'center' : 'right';
								table.push(align);
							}
							if (opt.tables !== false)
								builder.push('<table class="table table-bordered"><thead>');
							prev = 'table';
							ishead = true;
							i++;
						} else
							continue;
					}

					if (opt.tables !== false) {
						if (ishead)
							builder.push(markdown_table(line, table, true) + '</thead><tbody>');
						else
							builder.push(markdown_table(line, table));
					}
					ishead = false;
					continue;
				}

				if (line.charAt(0) === '#') {

					closeul();

					if (line.substring(0, 2) === '# ') {
						tmp = line.substring(2).trim();
						if (opt.headlines !== false)
							builder.push('<h1 id="' + markdown_id(tmp) + '">' + tmp + '</h1>');
						prev = '#';
						continue;
					}

					if (line.substring(0, 3) === '## ') {
						tmp = line.substring(3).trim();
						if (opt.headlines !== false)
							builder.push('<h2 id="' + markdown_id(tmp) + '">' + tmp + '</h2>');
						prev = '##';
						continue;
					}

					if (line.substring(0, 4) === '### ') {
						tmp = line.substring(4).trim();
						if (opt.headlines !== false)
							builder.push('<h3 id="' + markdown_id(tmp) + '">' + tmp + '</h3>');
						prev = '###';
						continue;
					}

					if (line.substring(0, 5) === '#### ') {
						tmp = line.substring(5).trim();
						if (opt.headlines !== false)
							builder.push('<h4 id="' + markdown_id(tmp) + '">' + tmp + '</h4>');
						prev = '####';
						continue;
					}

					if (line.substring(0, 6) === '##### ') {
						tmp = line.substring(6).trim();
						if (opt.headlines !== false)
							builder.push('<h5 id="' + markdown_id(tmp) + '">' + tmp + '</h5>');
						prev = '#####';
						continue;
					}
				}

				tmp = line.substring(0, 3);

				if (tmp === '---' || tmp === '***') {
					prev = 'hr';
					if (opt.hr !== false)
						builder.push('<hr class="markdown-line' + (tmp.charAt(0) === '-' ? '1' : '2') + '" />');
					continue;
				}

				// footnotes
				if ((/^#\d+:(\s)+/).test(line)) {
					if (opt.footnotes !== false) {
						tmp = line.indexOf(':');
						builder.push('<div class="markdown-footnotebody" data-id="{0}"><span>{0}:</span> {1}</div>'.format(line.substring(1, tmp).trim(), line.substring(tmp + 1).trim()));
					}
					continue;
				}

				if (line.substring(0, 5) === '&gt; ') {
					if (opt.blockquotes !== false)
						builder.push('<blockquote>' + line.substring(5).trim() + '</blockquote>');
					prev = '>';
					continue;
				}

				if (line.substring(0, 5) === '&lt; ') {
					if (opt.sections !== false)
						builder.push('<section>' + line.substring(5).trim() + '</section>');
					prev = '<';
					continue;
				}

				var tmpline = line.trim();

				if (opt.ul !== false && ordered.test(tmpline)) {

					var size = line.match(orderedsize);
					if (size)
						size = size[0].length;
					else
						size = 0;

					var append = false;

					if (prevsize !== size) {
						// NESTED
						if (size > prevsize) {
							prevsize = size;
							append = true;
							var index = builder.length - 1;
							builder[index] = builder[index].substring(0, builder[index].length - 5);
							prev = '';
						} else {
							// back to normal
							prevsize = size;
							builder.push('</' + ul.pop() + '>');
						}
					}

					var type = tmpline.charAt(0) === '-' ? 'ul' : 'ol';
					if (prev !== type) {
						var subtype;
						if (type === 'ol')
							subtype = tmpline.charAt(0);
						previndex = builder.push('<' + type + (subtype ? (' type="' + subtype + '"') : '') + '>') - 1;
						ul.push(type + (append ? '></li' : ''));
						prev = type;
						prevsize = size;
					}

					var tmpstr = (type === 'ol' ? tmpline.substring(tmpline.indexOf('.') + 1) : tmpline.substring(2));
					if (type !== 'ol') {
						var tt = tmpstr.substring(0, 3);
						if (tt === '[ ]' || tt === '[x]') {
							if (previndex != null)
								builder[previndex] = builder[previndex].replace('<ul', '<ul class="markdown-tasks"');
							previndex = null;
						}
					}

					builder.push('<li>' + tmpstr.trim().replace(/\[x\]/g, '<i class="fa fa-check-square green"></i>').replace(/\[\s\]/g, '<i class="far fa-square"></i>') + '</li>');

				} else {
					closeul();
					line && builder.push((opt.linetag ? ('<' + opt.linetag + '>') : '') + line.trim() + (opt.linetag ? ('</' + opt.linetag + '>') : ''));
					prev = 'p';
				}
			}

			closeul();
			table && opt.tables !== false && builder.push('</tbody></table>');
			iscode && opt.code !== false && builder.push('</code></pre>');
			if (!opt.noredraw && typeof(window) === 'object')
				setTimeout(FUNC.markdownredraw, 1, null, opt);
			return (opt.wrap ? ('<div class="markdown' + (nested ? '' : ' markdown-container') + '">') : '') + builder.join('\n').replace(/\t/g, '    ') + (opt.wrap ? '</div>' : '');
		};

	})();

}, ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/highlight.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/github.min.css']);

COMPONENT('layout', 'space:1;border:0;parent:window;margin:0;remember:1;autoresize:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var cache = {};
	var drag = {};
	var s = {};
	var events = {};
	var istop2 = false;
	var isbottom2 = false;
	var isright2 = false;
	var loaded = false;
	var resizecache = '';
	var settings;
	var prefkey = '';
	var prefexpire = '1 month';
	var isreset = false;
	var layout = null;

	self.readonly();

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);
		obj.on('resize', function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'layout' && com.dom.offsetParent && com.$ready && !com.$removed && com.config.autoresize)
					com.resize();
			}
		});
	};

	self.make = function() {

		self.aclass(cls);
		self.find('> section').each(function() {
			var el = $(this);
			var type = el.attrd('type');

			if (type.charAt(type.length - 1) === '2') {
				type = type.substring(0, type.length - 1);

				switch (type) {
					case 'top':
						istop2 = true;
						break;
					case 'bottom':
						isbottom2 = true;
						break;
					case 'right':
						isright2 = true;
						break;
				}
			}
			el.aclass(cls + '-' + type + ' hidden ui-layout-section');
			el.after('<div class="{0}-resize-{1} {0}-resize" data-type="{1}"></div>'.format(cls, type));
			el.after('<div class="{0}-lock hidden" data-type="{1}"></div>'.format(cls, type));
			s[type] = el;
		});

		self.find('> .{0}-resize'.format(cls)).each(function() {
			var el = $(this);
			s[el.attrd('type') + 'resize'] = el;
		});

		self.find('> .{0}-lock'.format(cls)).each(function() {
			var el = $(this);
			s[el.attrd('type') + 'lock'] = el;
		});

		var tmp = self.find('> script');
		if (tmp.length) {
			self.rebind(tmp.html(), true);
			tmp.remove();
		}

		events.bind = function() {
			var el = self.element;
			el.bind('mousemove', events.mmove);
			el.bind('mouseup', events.mup);
			el.bind('mouseleave', events.mup);
		};

		events.unbind = function() {
			var el = self.element;
			el.unbind('mousemove', events.mmove);
			el.unbind('mouseup', events.mup);
			el.unbind('mouseleave', events.mup);
		};

		events.mdown = function(e) {

			var target = $(e.target);
			var type = target.attrd('type');
			var w = self.width();
			var h = self.height();
			var m = 2; // size of line

			self.element.find('iframe').css('pointer-events', 'none');

			drag.cur = self.element.offset();
			drag.cur.top -= 10;
			drag.cur.left -= 8;
			drag.offset = target.offset();
			drag.el = target;
			drag.x = e.pageX;
			drag.y = e.pageY;
			drag.horizontal = type === 'left' || type === 'right' ? 1 : 0;
			drag.type = type;
			drag.plusX = 10;
			drag.plusY = 10;

			var ch = cache[type];
			var offset = 0;
			var min = ch.minsize ? (ch.minsize.value - 1) : 0;

			target.aclass(cls + '-drag');

			switch (type) {
				case 'top':
					drag.min = min || (ch.size - m);
					drag.max = (h - (cache.bottom ? s.bottom.height() : 0) - 50);
					break;
				case 'right':
					offset = w;
					drag.min = (cache.left ? s.left.width() : 0) + 50 + min;
					drag.max = offset - (min || ch.size);
					break;
				case 'bottom':
					offset = h;
					drag.min = (cache.top ? s.top.height() : 0) + 50;
					drag.max = offset - (min || ch.size);
					break;
				case 'left':
					drag.min = min || (ch.size - m);
					drag.max = w - (cache.right ? s.right.width() : 0) - 50;
					break;
			}

			events.bind();
		};

		events.mmove = function(e) {
			if (drag.horizontal) {
				var x = drag.offset.left + (e.pageX - drag.x) - drag.plusX - drag.cur.left;

				if (x < drag.min)
					x = drag.min + 1;

				if (x > drag.max)
					x = drag.max - 1;

				drag.el.css('left', x + 'px');

			} else {
				var y = drag.offset.top + (e.pageY - drag.y) - drag.plusY;

				if (y < drag.min)
					y = drag.min + 1;
				if (y > drag.max)
					y = drag.max - 1;

				drag.el.css('top', (y - drag.cur.top) + 'px');
			}
		};

		events.mup = function() {

			self.element.find('iframe').css('pointer-events', '');

			var offset = drag.el.offset();
			var d = WIDTH();
			var pk = prefkey + '_' + layout + '_' + drag.type + '_' + d;

			drag.el.rclass(cls + '-drag');

			if (drag.horizontal) {

				offset.left -= drag.cur.left;

				if (offset.left < drag.min)
					offset.left = drag.min;

				if (offset.left > drag.max)
					offset.left = drag.max;

				var w = offset.left - (drag.offset.left - drag.cur.left);

				if (!isright2 && drag.type === 'right')
					w = w * -1;

				drag.el.css('left', offset.left);
				w = s[drag.type].width() + w;
				s[drag.type].css('width', w);
				config.remember && PREF.set(pk, w, prefexpire);

			} else {

				offset.top -= drag.cur.top;

				if (offset.top < drag.min)
					offset.top = drag.min;
				if (offset.top > drag.max)
					offset.top = drag.max;

				drag.el.css('top', offset.top);

				var h = offset.top - (drag.offset.top - drag.cur.top);
				if (drag.type === 'bottom' || drag.type === 'preview')
					h = h * -1;

				h = s[drag.type].height() + h;
				s[drag.type].css('height', h);
				config.remember && PREF.set(pk, h, prefexpire);
			}

			events.unbind();
			self.refresh();
		};

		self.find('> ' + cls2 + '-resize').on('mousedown', events.mdown);
	};

	self.lock = function(type, b) {
		var el = s[type + 'lock'];
		el && el.tclass('hidden', b == null ? b : !b);
	};

	self.rebind = function(code, noresize) {
		code = code.trim();
		prefkey = 'L' + HASH(code);
		resizecache = '';
		settings = new Function('return ' + code)();
		!noresize && self.resize();
	};

	var getSize = function(display, data) {

		var obj = data[display];
		if (obj)
			return obj;

		switch (display) {
			case 'md':
				return getSize('lg', data);
			case 'sm':
				return getSize('md', data);
			case 'xs':
				return getSize('sm', data);
		}

		return data;
	};

	self.resize = function() {

		if (self.dom.offsetParent == null) {
			setTimeout(self.resize, 100);
			return;
		}

		if (settings == null)
			return;

		var d = WIDTH();
		var el = self.parent(config.parent);
		var width = el.width();
		var height = el.height();
		var key = d + 'x' + width + 'x' + height;

		if (resizecache === key)
			return;

		var tmp = layout ? settings[layout] : settings;

		if (tmp == null) {
			WARN('j-Layout: layout "{0}" not found'.format(layout));
			tmp = settings;
		}

		var size = getSize(d, tmp);
		var keys = Object.keys(s);

		height -= config.margin;
		resizecache = key;
		self.css({ width: width, height: height });

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			el = s[key];
			self.update(key, size[key] ? size[key] : settings[key]);
		}

		config.resize && EXEC(config.resize, d, width, height);
	};

	var parseSize = function(val, size) {
		var str = typeof(val) === 'string';
		var obj = { raw : str ? val.parseFloat() : val, percentage: str ? val.charAt(val.length - 1) === '%' : false };
		obj.value = obj.percentage ? ((((size / 100) * obj.raw) >> 0) - config.space) : obj.raw;
		return obj;
	};

	self.reset = function() {
		isreset = true;
		resizecache = '';
		self.resize();
	};

	self.layout = function(name) {

		if (name == null)
			name = '';

		if (layout != name) {
			layout = name;
			resizecache = '';
			self.resize();
		}
	};

	self.update = function(type, opt) {

		if (opt == null)
			return;

		if (typeof(opt) === 'string')
			opt = opt.parseConfig();

		if (s[type] == null)
			return;

		var el = s[type];
		var css = {};
		var is = 0;
		var size = null;
		var d = WIDTH();

		var c = cache[type];
		if (c == null)
			c = cache[type] = {};

		var w = self.width();
		var h = self.height();
		var pk = prefkey + '_' + layout + '_' + type + '_' + d;
		var cached = PREF.get(pk, prefexpire);

		if (isreset) {
			cached && PREF.set(pk); // remove value
			cached = 0;
		}

		c.minsize = opt.minwidth ? parseSize(opt.minwidth, w) : opt.minsize ? parseSize(opt.minsize, w) : 0;

		var def = getSize(d, settings);
		var width = (opt.size || opt.width) || (def[type] ? def[type].width : 0);
		var height = (opt.size || opt.height) || (def[type] ? def[type].height : 0);

		if (width && (type === 'left' || type === 'right')) {
			size = parseSize(width, w);
			c.size = size.value;
			css.width = cached ? cached : size.value;
			is = 1;
		}

		c.minsize = opt.minheight ? parseSize(opt.minheight, w) : opt.minsize ? parseSize(opt.minsize, w) : 0;
		if (height && (type === 'top' || type === 'bottom')) {
			size = parseSize(height, h);
			c.size = size.value;
			css.height = (cached ? cached : size.value);
			is = 1;
		}

		if (opt.show == null)
			opt.show = true;

		el.tclass('hidden', !opt.show);
		c.show = !!opt.show;
		c.resize = opt.resize == null ? false : !!opt.resize;
		el.tclass(cls + '-resizable', c.resize);
		s[type + 'resize'].tclass('hidden', !c.show || !c.resize);

		is && el.css(css);
		setTimeout2(self.ID + 'refresh', self.refresh, 50);
	};

	var getWidth = function(el) {
		return el.hclass('hidden') ? 0 : el.width();
	};

	var getHeight = function(el) {
		return el.hclass('hidden') ? 0 : el.height();
	};

	self.refresh = function() {

		var top = 0;
		var bottom = 0;
		var right = 0;
		var left = 0;
		var hidden = 'hidden';
		var top2 = 0;
		var bottom2 = 0;
		var space = 2;
		var topbottomoffset = 0;
		var right2visible = isright2 && !s.right.hclass(hidden);

		if (s.top)
			top = top2 = getHeight(s.top);

		if (s.bottom)
			bottom = bottom2 = getHeight(s.bottom);

		var width = self.width() - (config.border * 2);
		var height = self.height() - (config.border * 2);

		if (istop2) {
			topbottomoffset++;
			top2 = 0;
		}

		if (isbottom2) {
			topbottomoffset--;
			bottom2 = 0;
		}

		if (s.left && !s.left.hclass(hidden)) {
			var cssleft = {};
			space = top && bottom ? 2 : top || bottom ? 1 : 0;
			cssleft.left = 0;
			cssleft.top = istop2 ? config.border : (top ? (top + config.space) : 0);
			cssleft.height = isbottom2 ? (height - top2 - config.border) : (height - top2 - bottom2 - (config.space * space));
			cssleft.height += topbottomoffset;
			s.left.css(cssleft);
			cssleft.width = s.left.width();
			s.leftlock.css(cssleft);
			delete cssleft.width;
			left = s.left.width();
			cssleft.left = s.left.width();
			s.leftresize.css(cssleft);
			s.leftresize.tclass(hidden, !s.left.hclass(cls + '-resizable'));
		}

		if (s.right && !s.right.hclass(hidden)) {
			right = s.right.width();
			space = top && bottom ? 2 : top || bottom ? 1 : 0;
			var cssright = {};
			cssright.left = right2visible ? (getWidth(s.left) + config.border + config.space) : (width - right);
			cssright.top = istop2 ? config.border : (top ? (top + config.space) : 0);
			cssright.height = isbottom2 ? (height - top2 - config.border) : (height - top2 - bottom2 - (config.space * space));
			cssright.height += topbottomoffset;

			s.right.css(cssright);
			cssright.width = s.right.width();

			if ((cssright.width + cssright.left) === width) {
				s.right.css('left', 0);
				cssright.width++;
			}

			s.rightlock.css(cssright);
			delete cssright.width;

			if (right2visible)
				cssright.left += s.right.width();
			else
				cssright.left = width - right - 2;

			s.rightresize.css(cssright);
			s.rightresize.tclass(hidden, !s.right.hclass(cls + '-resizable'));
		}

		if (s.top) {
			var csstop = {};
			space = left ? config.space : 0;
			csstop.left = istop2 ? (left + space) : 0;

			if (right2visible && istop2)
				csstop.left += getWidth(s.right) + config.space;

			space = left && right ? 2 : left || right ? 1 : 0;
			csstop.width = istop2 ? (width - right - left - (config.space * space)) : width;
			csstop.top = 0;
			s.top.css(csstop);
			s.topresize.css(csstop);
			csstop.height = s.top.height();
			s.toplock.css(csstop);
			delete csstop.height;
			csstop.top = s.top.height();
			s.topresize.css(csstop);
			s.topresize.tclass(hidden, !s.top.hclass(cls + '-resizable'));
		}

		if (s.bottom) {
			var cssbottom = {};
			cssbottom.top = height - bottom;
			space = left ? config.space : 0;
			cssbottom.left = isbottom2 ? (left + space) : 0;

			if (right2visible && isbottom2)
				cssbottom.left += getWidth(s.right) + config.space;

			space = left && right ? 2 : left || right ? 1 : 0;
			cssbottom.width = isbottom2 ? (width - right - left - (config.space * space)) : width;
			s.bottom.css(cssbottom);
			cssbottom.height = s.bottom.height();
			s.bottomlock.css(cssbottom);
			delete cssbottom.height;
			cssbottom.top = cssbottom.top - 2;
			s.bottomresize.css(cssbottom);
			s.bottomresize.tclass(hidden, !s.bottom.hclass(cls + '-resizable'));
		}

		var space = left && right ? 2 : left ? 1 : right ? 1 : 0;
		var css = {};
		css.left = left ? left + config.space : 0;

		if (right2visible)
			css.left += getWidth(s.right) + config.space;

		css.width = (width - left - right - (config.space * space));
		css.top = top ? top + config.space : 0;

		space = top && bottom ? 2 : top || bottom ? 1 : 0;
		css.height = height - top - bottom - (config.space * space);

		s.main && s.main.css(css);
		s.mainlock && s.mainlock.css(css);

		self.element.SETTER('*', 'resize');

		if (loaded == false) {
			loaded = true;
			self.rclass('invisible');
		}

		isreset = false;
	};

	self.setter = function(value) {
		self.layout(value);
	};

});

COMPONENT('exec', function(self, config) {
	self.readonly();
	self.blind();
	self.make = function() {

		var scope = null;

		var scopepath = function(el, val) {
			if (!scope)
				scope = el.scope();
			return scope ? scope.makepath ? scope.makepath(val) : val.replace(/\?/g, el.scope().path) : val;
		};

		var fn = function(plus) {
			return function(e) {

				var el = $(this);
				var attr = el.attrd('exec' + plus);
				var path = el.attrd('path' + plus);
				var href = el.attrd('href' + plus);
				var def = el.attrd('def' + plus);
				var reset = el.attrd('reset' + plus);

				scope = null;

				var prevent = el.attrd('prevent' + plus);

				if (prevent === 'true' || prevent === '1') {
					e.preventDefault();
					e.stopPropagation();
				}

				if (attr) {
					if (attr.indexOf('?') !== -1)
						attr = scopepath(el, attr);
					EXEC(attr, el, e);
				}

				href && NAV.redirect(href);

				if (def) {
					if (def.indexOf('?') !== -1)
						def = scopepath(el, def);
					DEFAULT(def);
				}

				if (reset) {
					if (reset.indexOf('?') !== -1)
						reset = scopepath(el, reset);
					RESET(reset);
				}

				if (path) {
					var val = el.attrd('value');
					if (val) {
						if (path.indexOf('?') !== -1)
							path = scopepath(el, path);
						var v = GET(path);
						SET(path, new Function('value', 'return ' + val)(v), true);
					}
				}
			};
		};

		self.event('dblclick', config.selector2 || '.exec2', fn('2'));
		self.event('click', config.selector || '.exec', fn(''));
	};
});

COMPONENT('selected', 'class:selected;selector:a;attr:if', function(self, config) {

	self.readonly();

	self.configure = function(key, value) {
		switch (key) {
			case 'datasource':
				self.datasource(value, function() {
					self.refresh();
				});
				break;
		}
	};

	self.setter = function(value) {
		var cls = config.class;
		self.find(config.selector).each(function() {
			var el = $(this);
			if (el.attrd(config.attr) === value)
				el.aclass(cls);
			else
				el.hclass(cls) && el.rclass(cls);
		});
	};
});

COMPONENT('largeform', 'zindex:12;padding:30;scrollbar:1;visibleY:0;scrolltop:1;closeoutside:0;style:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var csspos = {};
	var nav = false;
	var init = false;

	if (!W.$$largeform) {

		W.$$largeform_level = W.$$largeform_level || 1;
		W.$$largeform = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2(self.name, function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'largeform' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		if (W.OP)
			W.OP.on('resize', resize);
		else
			$(W).on('resize', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			if (e.target === this) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			var el = $(e.target);
			if (el.hclass(cls + '-container') && !el.hclass(cls + '-style-2')) {
				var form = el.find(cls2);
				var c = cls + '-animate-click';
				form.aclass(c);
				setTimeout(function() {
					form.rclass(c);
				}, 300);
			}
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		self.set('');
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
	};

	self.resize = function() {

		if (self.hclass('hidden'))
			return;

		var padding = isMOBILE ? 0 : config.padding;
		var ui = self.find(cls2);

		csspos.height = WH - (config.style == 1 ? (padding * 2) : padding);
		csspos.top = padding;
		ui.css(csspos);

		var el = self.find(cls2 + '-title');
		var th = el.height();
		csspos = { height: csspos.height - th, width: ui.width() };

		if (nav)
			csspos.height -= nav.height();

		self.find(cls2 + '-body').css(csspos);
		self.scrollbar && self.scrollbar.resize();
		self.element.SETTER('*', 'resize');
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__html span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div><div class="{4}-body"></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		scr.length && scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2 + '-body')[0];

		while (self.dom.children.length) {
			var child = self.dom.children[0];
			if (child.tagName === 'NAV') {
				nav = $(child);
				body.parentNode.appendChild(child);
			} else
				body.appendChild(child);
		}

		self.rclass('hidden invisible');
		self.replace(el, true);

		if (config.scrollbar)
			self.scrollbar = SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, orientation: 'y' });

		if (config.style === 2)
			self.aclass(cls + '-style-2');

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (!init) {
			switch (key) {
				case 'width':
					value !== prev && self.find(cls2).css('max-width', value + 'px');
					break;
				case 'closebutton':
					self.find(cls2 + '-button-close').tclass('hidden', value !== true);
					break;
			}
		}
	};

	self.setter = function(value) {

		setTimeout2(cls + '-noscroll', function() {
			$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
		}, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && EXEC(config.reload, self);
				config.default && DEFAULT(config.default, true);
				config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$largeform_level--;
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$largeform_level < 1)
			W.$$largeform_level = 1;

		W.$$largeform_level++;

		self.css('z-index', W.$$largeform_level * config.zindex);
		self.rclass('hidden');

		self.release(false);
		config.scrolltop && self.scrollbar && self.scrollbar.scrollTop(0);

		config.reload && EXEC(config.reload, self);
		config.default && DEFAULT(config.default, true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		self.resize();

		setTimeout(function() {
			self.rclass('invisible');
			self.find(cls2).aclass(cls + '-animate');
			if (!init && isMOBILE) {
				$('body').aclass('hidden');
				setTimeout(function() {
					$('body').rclass('hidden');
				}, 50);
			}
			init = true;
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$largeform_level * config.zindex) + 1);
		}, 500);
	};
});

COMPONENT('input', 'maxlength:200;dirkey:name;dirvalue:id;increment:1;autovalue:name;direxclude:false;forcevalidation:1;searchalign:1;after:\\:', function(self, config, cls) {

	var cls2 = '.' + cls;
	var input, placeholder, dirsource, binded, customvalidator, mask, rawvalue, isdirvisible = false, nobindcamouflage = false, focused = false;

	self.nocompile();
	self.bindvisible(20);

	self.init = function() {
		Thelpers.ui_input_icon = function(val) {
			return val.charAt(0) === '!' ? ('<span class="ui-input-icon-custom">' + val.substring(1) + '</span>') : ('<i class="fa fa-' + val + '"></i>');
		};
		W.ui_input_template = Tangular.compile(('{{ if label }}<div class="{0}-label">{{ if icon }}<i class="fa fa-{{ icon }}"></i>{{ fi }}{{ label | raw }}{{ after | raw }}</div>{{ fi }}<div class="{0}-control{{ if licon }} {0}-licon{{ fi }}{{ if ricon || (type === \'number\' && increment) }} {0}-ricon{{ fi }}">{{ if ricon || (type === \'number\' && increment) }}<div class="{0}-icon-right{{ if type === \'number\' && increment && !ricon }} {0}-increment{{ else if riconclick || type === \'date\' || type === \'time\' || (type === \'search\' && searchalign === 1) || type === \'password\' }} {0}-click{{ fi }}">{{ if type === \'number\' && !ricon }}<i class="fa fa-caret-up"></i><i class="fa fa-caret-down"></i>{{ else }}{{ ricon | ui_input_icon }}{{ fi }}</div>{{ fi }}{{ if licon }}<div class="{0}-icon-left{{ if liconclick || (type === \'search\' && searchalign !== 1) }} {0}-click{{ fi }}">{{ licon | ui_input_icon }}</div>{{ fi }}<div class="{0}-input{{ if align === 1 || align === \'center\' }} center{{ else if align === 2 || align === \'right\' }} right{{ fi }}">{{ if placeholder && !innerlabel }}<div class="{0}-placeholder">{{ placeholder }}</div>{{ fi }}{{ if dirsource || type === \'icon\' || type === \'emoji\' || type === \'color\' }}<div class="{0}-value" tabindex="0"></div>{{ else }}<input type="{{ if type === \'password\' }}password{{ else }}text{{ fi }}"{{ if autofill }} autocomplete="on" name="{{ PATH }}"{{ else }} name="input' + Date.now() + '" autocomplete="new-password"{{ fi }} data-jc-bind=""{{ if maxlength > 0}} maxlength="{{ maxlength }}"{{ fi }}{{ if autofocus }} autofocus{{ fi }} />{{ fi }}</div></div>{{ if error }}<div class="{0}-error hidden"><i class="fa fa-warning"></i> {{ error }}</div>{{ fi }}').format(cls));
	};

	self.make = function() {

		if (!config.label)
			config.label = self.html();

		if (isMOBILE && config.autofocus)
			config.autofocus = false;

		config.PATH = self.path.replace(/\./g, '_');

		self.aclass(cls + ' invisible');
		self.rclass('invisible', 100);
		self.redraw();

		self.event('input change', function() {
			if (nobindcamouflage)
				nobindcamouflage = false;
			else
				self.check();
		});

		self.event('focus', 'input,' + cls2 + '-value', function() {

			if (config.disabled)
				return $(this).blur();

			focused = true;
			self.camouflage(false);
			self.aclass(cls + '-focused');
			config.autocomplete && EXEC(self.makepath(config.autocomplete), self, input.parent());
			if (config.autosource) {
				var opt = {};
				opt.element = self.element;
				opt.search = GET(self.makepath(config.autosource));
				opt.callback = function(value) {
					var val = typeof(value) === 'string' ? value : value[config.autovalue];
					if (config.autoexec) {
						EXEC(self.makepath(config.autoexec), value, function(val) {
							self.set(val, 2);
							self.change();
							self.bindvalue();
						});
					} else {
						self.set(val, 2);
						self.change();
						self.bindvalue();
					}
				};
				SETTER('autocomplete', 'show', opt);
			} else if (config.mask) {
				setTimeout(function(input) {
					input.selectionStart = input.selectionEnd = 0;
				}, 50, this);
			} else if (config.dirsource && (config.autofocus != false && config.autofocus != 0)) {
				if (!isdirvisible)
					self.find(cls2 + '-control').trigger('click');
			}
		});

		self.event('paste', 'input', function(e) {
			if (config.mask) {
				var val = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
				self.set(val.replace(/\s|\t/g, ''));
				e.preventDefault();
			}
		});

		self.event('keydown', 'input', function(e) {

			var t = this;
			var code = e.which;

			if (t.readOnly || config.disabled) {
				// TAB
				if (e.keyCode !== 9) {
					if (config.dirsource) {
						self.find(cls2 + '-control').trigger('click');
						return;
					}
					e.preventDefault();
					e.stopPropagation();
				}
				return;
			}

			if (!config.disabled && config.dirsource && (code === 13 || code > 30)) {
				self.find(cls2 + '-control').trigger('click');
				return;
			}

			if (config.mask) {

				if (e.metaKey) {
					if (code === 8 || code === 127) {
						e.preventDefault();
						e.stopPropagation();
					}
					return;
				}

				if (code === 32) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}

				var beg = e.target.selectionStart;
				var end = e.target.selectionEnd;
				var val = t.value;
				var c;

				if (code === 8 || code === 127) {

					if (beg === end) {
						c = config.mask.substring(beg - 1, beg);
						t.value = val.substring(0, beg - 1) + c + val.substring(beg);
						self.curpos(beg - 1);
					} else {
						for (var i = beg; i <= end; i++) {
							c = config.mask.substring(i - 1, i);
							val = val.substring(0, i - 1) + c + val.substring(i);
						}
						t.value = val;
						self.curpos(beg);
					}

					e.preventDefault();
					return;
				}

				if (code > 40) {

					var cur = String.fromCharCode(code);

					if (mask && mask[beg]) {
						if (!mask[beg].test(cur)) {
							e.preventDefault();
							return;
						}
					}

					c = config.mask.charCodeAt(beg);
					if (c !== 95) {
						beg++;
						while (true) {
							c = config.mask.charCodeAt(beg);
							if (c === 95 || isNaN(c))
								break;
							else
								beg++;
						}
					}

					if (c === 95) {

						val = val.substring(0, beg) + cur + val.substring(beg + 1);
						t.value = val;
						beg++;

						while (beg < config.mask.length) {
							c = config.mask.charCodeAt(beg);
							if (c === 95)
								break;
							else
								beg++;
						}

						self.curpos(beg);
					} else
						self.curpos(beg + 1);

					e.preventDefault();
					e.stopPropagation();
				}
			}

		});

		self.event('blur', 'input', function() {
			focused = false;
			self.camouflage(true);
			self.rclass(cls + '-focused');
		});

		self.event('click', cls2 + '-control', function() {

			if (config.disabled || isdirvisible)
				return;

			if (config.type === 'icon') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(val) {
					self.change(true);
					self.set(val);
					self.check();
					rawvalue.focus();
				};
				SETTER('faicons', 'show', opt);
				return;
			} else if (config.type === 'color') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(al) {
					self.change(true);
					self.set(al);
					self.check();
					rawvalue.focus();
				};
				SETTER('colorpicker', 'show', opt);
				return;
			} else if (config.type === 'emoji') {
				opt = {};
				opt.element = self.element;
				opt.value = self.get();
				opt.empty = true;
				opt.callback = function(al) {
					self.change(true);
					self.set(al);
					self.check();
					rawvalue.focus();
				};
				SETTER('emoji', 'show', opt);
				return;
			}

			if (!config.dirsource)
				return;

			isdirvisible = true;
			setTimeout(function() {
				isdirvisible = false;
			}, 500);

			var opt = {};
			opt.element = self.find(cls2 + '-control');
			opt.items = dirsource || GET(self.makepath(config.dirsource));
			opt.offsetY = -1 + (config.diroffsety || 0);
			opt.offsetX = 0 + (config.diroffsetx || 0);
			opt.placeholder = config.dirplaceholder;
			opt.render = config.dirrender ? GET(self.makepath(config.dirrender)) : null;
			opt.custom = !!config.dircustom;
			opt.offsetWidth = 2;
			opt.minwidth = config.dirminwidth || 200;
			opt.maxwidth = config.dirmaxwidth;
			opt.key = config.dirkey || config.key;
			opt.empty = config.dirempty;

			if (config.dirsearch === false)
				opt.search = false;

			var val = self.get();
			opt.selected = val;

			if (dirsource && config.direxclude == false) {
				for (var i = 0; i < dirsource.length; i++) {
					var item = dirsource[i];
					if (item)
						item.selected = typeof(item) === 'object' && item[config.dirvalue] === val;
				}
			} else if (config.direxclude) {
				opt.exclude = function(item) {
					return item ? item[config.dirvalue] === val : false;
				};
			}

			opt.callback = function(item, el, custom) {

				// empty
				if (item == null) {
					rawvalue.html('');
					self.set(null, 2);
					self.change();
					self.check();
					return;
				}

				var val = custom || typeof(item) === 'string' ? item : item[config.dirvalue || config.value];
				if (custom && typeof(config.dircustom) === 'string') {
					var fn = GET(config.dircustom);
					fn(val, function(val) {
						self.set(val, 2);
						self.change();
						self.bindvalue();
					});
				} else if (custom) {
					if (val) {
						self.set(val, 2);
						self.change();
						if (dirsource)
							self.bindvalue();
						else
							input.val(val);
					}
				} else {
					self.set(val, 2);
					self.change();
					if (dirsource)
						self.bindvalue();
					else
						input.val(val);
				}

				rawvalue.focus();
			};

			SETTER('directory', 'show', opt);
		});

		self.event('click', cls2 + '-placeholder,' + cls2 + '-label', function(e) {
			if (!config.disabled) {
				if (config.dirsource) {
					e.preventDefault();
					e.stopPropagation();
					self.find(cls2 + '-control').trigger('click');
				} else if (!config.camouflage || $(e.target).hclass(cls + '-placeholder')) {
					if (input.length)
						input.focus();
					else
						rawvalue.focus();
				}
			}
		});

		self.event('click', cls2 + '-icon-left,' + cls2 + '-icon-right', function(e) {

			if (config.disabled)
				return;

			var el = $(this);
			var left = el.hclass(cls + '-icon-left');
			var opt;

			if (config.dirsource && left && config.liconclick) {
				e.preventDefault();
				e.stopPropagation();
			}

			if (!left && !config.riconclick) {
				if (config.type === 'date') {
					opt = {};
					opt.element = self.element;
					opt.value = self.get();
					opt.callback = function(val) {
						self.change(true);
						self.set(val);
						input.focus();
					};
					SETTER('datepicker', 'show', opt);
				} else if (config.type === 'time') {
					opt = {};
					opt.element = self.element;
					opt.value = self.get();
					opt.callback = function(val) {
						self.change(true);
						self.set(val);
						input.focus();
					};
					SETTER('timepicker', 'show', opt);
				} else if (config.type === 'search')
					self.set('');
				else if (config.type === 'password')
					self.password();
				else if (config.type === 'number') {
					var tmp = $(e.target);
					if (tmp.attr('class').indexOf('fa-') !== -1) {
						var n = tmp.hclass('fa-caret-up') ? 1 : -1;
						self.change(true);
						self.inc(config.increment * n);
					}
				}
				return;
			}

			if (left && config.liconclick)
				EXEC(self.makepath(config.liconclick), self, el);
			else if (config.riconclick)
				EXEC(self.makepath(config.riconclick), self, el);
			else if (left && config.type === 'search')
				self.set('');

		});
	};

	self.camouflage = function(is) {
		if (config.camouflage) {
			if (is) {
				var t = input[0];
				var arr = t.value.split('');
				for (var i = 0; i < arr.length; i++)
					arr[i] = typeof(config.camouflage) === 'string' ? config.camouflage : '*';
				nobindcamouflage = true;
				t.value = arr.join('');
			} else {
				nobindcamouflage = true;
				var val = self.get();
				input[0].value = val == null ? '' : val;
			}
			self.tclass(cls + '-camouflaged', is);
		}
	};

	self.curpos = function(pos) {
		var el = input[0];
		if (el.createTextRange) {
			var range = el.createTextRange();
			range.move('character', pos);
			range.select();
		} else if (el.selectionStart) {
			el.focus();
			el.setSelectionRange(pos, pos);
		}
	};

	self.validate = function(value) {

		if ((!config.required || config.disabled) && !self.forcedvalidation())
			return true;

		if (config.dirsource)
			return !!value;

		if (customvalidator)
			return customvalidator(value);

		if (self.type === 'date')
			return value instanceof Date && !isNaN(value.getTime());

		if (value == null)
			value = '';
		else
			value = value.toString();

		if (config.mask && typeof(value) === 'string' && value.indexOf('_') !== -1)
			return false;

		if (config.minlength && value.length < config.minlength)
			return false;

		switch (self.type) {
			case 'email':
				return value.isEmail();
			case 'phone':
				return value.isPhone();
			case 'url':
				return value.isURL();
			case 'zip':
				return (/^\d{5}(?:[-\s]\d{4})?$/).test(value);
			case 'currency':
			case 'number':
				value = value.parseFloat();
				if ((config.minvalue != null && value < config.minvalue) || (config.maxvalue != null && value > config.maxvalue))
					return false;
				return config.minvalue == null ? value > 0 : true;
		}

		return value.length > 0;
	};

	self.offset = function() {
		var offset = self.element.offset();
		var control = self.find(cls2 + '-control');
		var width = control.width() + 2;
		return { left: offset.left, top: control.offset().top + control.height(), width: width };
	};

	self.password = function(show) {
		var visible = show == null ? input.attr('type') === 'text' : show;
		input.attr('type', visible ? 'password' : 'text');
		self.find(cls2 + '-icon-right').find('i').tclass(config.ricon, visible).tclass('fa-eye-slash', !visible);
	};

	self.getterin = self.getter;
	self.getter = function(value, realtime, nobind) {

		if (nobindcamouflage)
			return;

		if (config.mask && config.masktidy) {
			var val = [];
			for (var i = 0; i < value.length; i++) {
				if (config.mask.charAt(i) === '_')
					val.push(value.charAt(i));
			}
			value = val.join('');
		}

		self.getterin(value, realtime, nobind);
	};

	self.setterin = self.setter;

	self.setter = function(value, path, type) {

		if (config.mask) {
			if (value) {
				if (config.masktidy) {
					var index = 0;
					var val = [];
					for (var i = 0; i < config.mask.length; i++) {
						var c = config.mask.charAt(i);
						val.push(c === '_' ? (value.charAt(index++) || '_') : c);
					}
					value = val.join('');
				}

				// check values
				if (mask) {
					var arr = [];
					for (var i = 0; i < mask.length; i++) {
						var c = value.charAt(i);
						if (mask[i] && mask[i].test(c))
							arr.push(c);
						else
							arr.push(config.mask.charAt(i));
					}
					value = arr.join('');
				}
			} else
				value = config.mask;
		}

		self.setterin(value, path, type);
		self.bindvalue();

		config.camouflage && !focused && setTimeout(self.camouflage, type === 1 ? 1000 : 1, true);

		if (config.type === 'password')
			self.password(true);
	};

	self.check = function() {

		var is = input.length ? !!input[0].value : !!self.get();

		if (binded === is)
			return;

		binded = is;
		placeholder && placeholder.tclass('hidden', is);
		self.tclass(cls + '-binded', is);

		if (config.type === 'search')
			self.find(cls2 + '-icon-' + (config.searchalign === 1 ? 'right' : 'left')).find('i').tclass(config.searchalign === 1 ? config.ricon : config.licon, !is).tclass('fa-times', is);
	};

	self.bindvalue = function() {

		var value = self.get();

		if (dirsource) {

			var item;

			for (var i = 0; i < dirsource.length; i++) {
				item = dirsource[i];
				if (typeof(item) === 'string') {
					if (item === value)
						break;
					item = null;
				} else if (item[config.dirvalue || config.value] === value) {
					item = item[config.dirkey || config.key];
					break;
				} else
					item = null;
			}

			if (value && item == null && config.dircustom)
				item = value;

			rawvalue.text(item || '');

		} else if (config.dirsource)
			rawvalue.text(value || '');
		else {
			switch (config.type) {
				case 'color':
					rawvalue.css('background-color', value || '');
					break;
				case 'icon':
					rawvalue.html('<i class="{0}"></i>'.format(value || ''));
					break;
				case 'emoji':
					rawvalue.html(value);
					break;
			}
		}

		self.check();
	};

	self.redraw = function() {

		if (!config.ricon) {
			if (config.dirsource)
				config.ricon = 'angle-down';
			else if (config.type === 'date') {
				config.ricon = 'calendar';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'icon' || config.type === 'color' || config.type === 'emoji') {
				config.ricon = 'angle-down';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'time') {
				config.ricon = 'clock-o';
				if (!config.align && !config.innerlabel)
					config.align = 1;
			} else if (config.type === 'search')
				if (config.searchalign === 1)
					config.ricon = 'search';
				else
					config.licon = 'search';
			else if (config.type === 'password')
				config.ricon = 'eye';
			else if (config.type === 'number') {
				if (!config.align && !config.innerlabel)
					config.align = 1;
			}
		}

		self.tclass(cls + '-masked', !!config.mask);
		self.rclass2(cls + '-type-');

		if (config.type)
			self.aclass(cls + '-type-' + config.type);

		self.html(W.ui_input_template(config));
		input = self.find('input');
		rawvalue = self.find(cls2 + '-value');
		placeholder = self.find(cls2 + '-placeholder');
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'dirsource':
				if (config.dirajax || value.indexOf('/') !== -1) {
					dirsource = null;
					self.bindvalue();
				} else {
					self.datasource(value, function(path, value) {
						dirsource = value;
						self.bindvalue();
					});
				}
				self.tclass(cls + '-dropdown', !!value);
				input.prop('readonly', !!config.disabled || !!config.dirsource);
				break;
			case 'disabled':
				self.tclass('ui-disabled', !!value);
				input.prop('readonly', !!value || !!config.dirsource);
				self.reset();
				break;
			case 'required':
				self.tclass(cls + '-required', !!value);
				self.reset();
				break;
			case 'type':
				self.type = value;
				break;
			case 'validate':
				customvalidator = value ? (/\(|=|>|<|\+|-|\)/).test(value) ? FN('value=>' + value) : (function(path) { return function(value) { return GET(path)(value); }; })(value) : null;
				break;
			case 'innerlabel':
				self.tclass(cls + '-inner', value);
				break;
			case 'maskregexp':
				if (value) {
					mask = value.toLowerCase().split(',');
					for (var i = 0; i < mask.length; i++) {
						var m = mask[i];
						if (!m || m === 'null')
							mask[i] = '';
						else
							mask[i] = new RegExp(m);
					}
				} else
					mask = null;
				break;
			case 'mask':
				config.mask = value.replace(/#/g, '_');
				break;
		}
	};

	self.formatter(function(path, value) {
		if (value) {
			switch (config.type) {
				case 'lower':
					return value.toString().toLowerCase();
				case 'upper':
					return value.toString().toUpperCase();
				case 'date':
					return value.format(config.format || 'yyyy-MM-dd');
				case 'time':
					return value.format(config.format || 'HH:mm');
				case 'number':
					return config.format ? value.format(config.format) : value;
			}
		}

		return value;
	});

	self.parser(function(path, value) {
		if (value) {
			var tmp;
			switch (config.type) {
				case 'date':
					tmp = self.get();
					if (tmp)
						tmp = tmp.format('HH:mm');
					else
						tmp = '';
					return value + (tmp ? (' ' + tmp) : '');
				case 'lower':
					value = value.toLowerCase();
					break;
				case 'upper':
					value = value.toUpperCase();
					break;
				case 'slug':
					value = value.slug();
					break;
				case 'time':
					tmp = value.split(':');
					var dt = self.get();
					if (dt == null)
						dt = new Date();
					dt.setHours(+(tmp[0] || '0'));
					dt.setMinutes(+(tmp[1] || '0'));
					dt.setSeconds(+(tmp[2] || '0'));
					value = dt;
					break;
			}
		}
		return value ? config.spaces === false ? value.replace(/\s/g, '') : value : value;
	});

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : self.forcedvalidation() ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass(cls + '-invalid', invalid);
		config.error && self.find(cls2 + '-error').tclass('hidden', !invalid);
	};

	self.forcedvalidation = function() {

		if (!config.forcevalidation)
			return false;

		if (self.type === 'number')
			return false;

		var val = self.get();
		return (self.type === 'phone' || self.type === 'email') && (val != null && (typeof(val) === 'string' && val.length !== 0));
	};

});

COMPONENT('codemirror', 'linenumbers:true;required:false;trim:false;tabs:true;height:200;minheight:200', function(self, config, cls) {

	var editor, container;
	var cls2 = '.' + cls;

	self.getter = null;
	self.bindvisible();
	self.nocompile();

	self.reload = function() {
		editor.refresh();
		editor.display.scrollbars.update(true);
	};

	self.validate = function(value) {
		return (config.disabled || !config.required ? true : value && value.length > 0) === true;
	};

	self.insert = function(value) {
		editor.replaceSelection(value);
		self.change(true);
	};

	self.configure = function(key, value, init) {
		if (init)
			return;

		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				editor.readOnly = value;
				editor.refresh();
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				self.state(1, 1);
				break;
			case 'icon':
				self.find('i').rclass().aclass(value.indexOf(' ') === -1 ? ('fa fa-' + value) : value);
				break;
		}

	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {
		if (config.parent) {
			var parent = self.parent(config.parent);
			var h = parent.height();

			if (h < config.minheight)
				h = config.minheight;

			editor.setSize('100%', (h - config.margin) + 'px');
			self.css('height', h - config.margin);
		} else
			editor.setSize('100%', config.height + 'px');
	};

	self.make = function() {

		var findmatch = function() {

			if (config.mode === 'todo') {
				self.todo_done();
				return;
			}

			var sel = editor.getSelections()[0];
			var cur = editor.getCursor();
			var count = editor.lineCount();
			var before = editor.getLine(cur.line).substring(cur.ch, cur.ch + sel.length) === sel;
			var beg = cur.ch + (before ? sel.length : 0);
			for (var i = cur.line; i < count; i++) {
				var ch = editor.getLine(i).indexOf(sel, beg);
				if (ch !== -1) {
					editor.doc.addSelection({ line: i, ch: ch }, { line: i, ch: ch + sel.length });
					break;
				}
				beg = 0;
			}
		};

		var content = config.label || self.html();
		self.html(((content ? '<div class="{0}-label' + (config.required ? ' {0}-label-required' : '') + '">' + (config.icon ? '<i class="fa fa-' + config.icon + '"></i> ' : '') + content + ':</div>' : '') + '<div class="{0}"></div>').format(cls));
		container = self.find(cls2);

		var options = {};
		options.lineNumbers = config.linenumbers;
		options.mode = config.type || 'htmlmixed';
		options.indentUnit = 4;
		options.scrollbarStyle = 'simple';
		options.scrollPastEnd = true;
		options.extraKeys = { 'Cmd-D': findmatch, 'Ctrl-D': findmatch };

		if (config.tabs)
			options.indentWithTabs = true;

		if (config.type === 'markdown') {
			options.styleActiveLine = true;
			options.lineWrapping = true;
			options.matchBrackets = true;
		}

		options.showTrailingSpace = false;

		editor = CodeMirror(container[0], options);
		self.editor = editor;

		editor.on('keydown', function(editor, e) {

			if (e.shiftKey && e.ctrlKey && (e.keyCode === 40 || e.keyCode === 38)) {
				var tmp = editor.getCursor();
				editor.doc.addSelection({ line: tmp.line + (e.keyCode === 40 ? 1 : -1), ch: tmp.ch });
				e.stopPropagation();
				e.preventDefault();
			}

			if (e.keyCode === 13) {
				var tmp = editor.getCursor();
				var line = editor.lineInfo(tmp.line);
				if ((/^\t+$/).test(line.text))
					editor.replaceRange('', { line: tmp.line, ch: 0 }, { line: tmp.line, ch: line.text.length });
				return;
			}

			if (e.keyCode === 27)
				e.stopPropagation();

		});

		if (config.disabled) {
			self.aclass('ui-disabled');
			editor.readOnly = true;
			editor.refresh();
		}

		editor.on('drop',function(editor, e) {
			config.drop && self.SEEX(config.drop, e, editor);
		});

		var can = {};
		can['+input'] = can['+delete'] = can.undo = can.redo = can.paste = can.cut = can.clear = true;

		editor.on('change', function(a, b) {

			if (config.disabled || !can[b.origin])
				return;

			setTimeout2(self.id, function() {
				var val = editor.getValue();

				if (config.trim) {
					var lines = val.split('\n');
					for (var i = 0, length = lines.length; i < length; i++)
						lines[i] = lines[i].replace(/\s+$/, '');
					val = lines.join('\n').trim();
				}

				self.getter2 && self.getter2(val);
				self.change(true);
				self.rewrite(val, 2);
				config.required && self.validate2();
			}, 200);

		});

		self.resize();
		self.on('resize + resize2', self.resize);
	};

	self.setter = function(value, path, type) {

		editor.setValue(value || '');
		editor.refresh();

		setTimeout(function() {
			editor.refresh();
			editor.scrollTo(0, 0);
			type && editor.setCursor(0);
		}, 200);

		setTimeout(function() {
			editor.refresh();
		}, 1000);

		setTimeout(function() {
			editor.refresh();
		}, 2000);
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		container.tclass(cls + '-invalid', invalid);
	};

}, ['//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.css', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/javascript/javascript.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/htmlmixed/htmlmixed.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/xml/xml.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/css/css.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/markdown/markdown.min.js', function(next) {

	CodeMirror.defineMode('totaljsresources', function() {
		var REG_KEY = /^[a-z0-9_\-.#]+/i;
		return {

			startState: function() {
				return { type: 0, keyword: 0 };
			},

			token: function(stream, state) {

				var m;

				if (stream.sol()) {

					var line = stream.string;
					if (line.substring(0, 2) === '//') {
						stream.skipToEnd();
						return 'comment';
					}

					state.type = 0;
				}

				m = stream.match(REG_KEY, true);
				if (m)
					return 'tag';

				if (!stream.string) {
					stream.next();
					return '';
				}

				var count = 0;

				while (true) {

					count++;
					if (count > 5000)
						break;

					var c = stream.peek();
					if (c === ':') {
						stream.skipToEnd();
						return 'def';
					}

					if (c === '(') {
						if (stream.skipTo(')')) {
							stream.eat(')');
							return 'variable-L';
						}
					}

				}

				stream.next();
				return '';
			}
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		function Bar(cls, orientation, scroll) {
			var self = this;
			self.orientation = orientation;
			self.scroll = scroll;
			self.screen = self.total = self.size = 1;
			self.pos = 0;

			self.node = document.createElement('div');
			self.node.className = cls + '-' + orientation;
			self.inner = self.node.appendChild(document.createElement('div'));

			CodeMirror.on(self.inner, 'mousedown', function(e) {

				if (e.which != 1)
					return;

				CodeMirror.e_preventDefault(e);
				var axis = self.orientation == 'horizontal' ? 'pageX' : 'pageY';
				var start = e[axis], startpos = self.pos;

				function done() {
					CodeMirror.off(document, 'mousemove', move);
					CodeMirror.off(document, 'mouseup', done);
				}

				function move(e) {
					if (e.which != 1)
						return done();
					self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
				}

				CodeMirror.on(document, 'mousemove', move);
				CodeMirror.on(document, 'mouseup', done);
			});

			CodeMirror.on(self.node, 'click', function(e) {
				CodeMirror.e_preventDefault(e);
				var innerBox = self.inner.getBoundingClientRect(), where;
				if (self.orientation == 'horizontal')
					where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;
				else
					where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
				self.moveTo(self.pos + where * self.screen);
			});

			function onWheel(e) {
				var moved = CodeMirror.wheelEventPixels(e)[self.orientation == 'horizontal' ? 'x' : 'y'];
				var oldPos = self.pos;
				self.moveTo(self.pos + moved);
				if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
			}
			CodeMirror.on(self.node, 'mousewheel', onWheel);
			CodeMirror.on(self.node, 'DOMMouseScroll', onWheel);
		}

		Bar.prototype.setPos = function(pos, force) {
			var t = this;
			if (pos < 0)
				pos = 0;
			if (pos > t.total - t.screen)
				pos = t.total - t.screen;
			if (!force && pos == t.pos)
				return false;
			t.pos = pos;
			t.inner.style[t.orientation == 'horizontal' ? 'left' : 'top'] = (pos * (t.size / t.total)) + 'px';
			return true;
		};

		Bar.prototype.moveTo = function(pos) {
			var t = this;
			t.setPos(pos) && t.scroll(pos, t.orientation);
		};

		var minButtonSize = 10;

		Bar.prototype.update = function(scrollSize, clientSize, barSize) {
			var t = this;
			var sizeChanged = t.screen != clientSize || t.total != scrollSize || t.size != barSize;

			if (sizeChanged) {
				t.screen = clientSize;
				t.total = scrollSize;
				t.size = barSize;
			}

			var buttonSize = t.screen * (t.size / t.total);
			if (buttonSize < minButtonSize) {
				t.size -= minButtonSize - buttonSize;
				buttonSize = minButtonSize;
			}

			t.inner.style[t.orientation == 'horizontal' ? 'width' : 'height'] = buttonSize + 'px';
			t.setPos(t.pos, sizeChanged);
		};

		function SimpleScrollbars(cls, place, scroll) {
			var t = this;
			t.addClass = cls;
			t.horiz = new Bar(cls, 'horizontal', scroll);
			place(t.horiz.node);
			t.vert = new Bar(cls, 'vertical', scroll);
			place(t.vert.node);
			t.width = null;
		}

		SimpleScrollbars.prototype.update = function(measure) {
			var t = this;
			if (t.width == null) {
				var style = window.getComputedStyle ? window.getComputedStyle(t.horiz.node) : t.horiz.node.currentStyle;
				if (style)
					t.width = parseInt(style.height);
			}

			var width = t.width || 0;
			var needsH = measure.scrollWidth > measure.clientWidth + 1;
			var needsV = measure.scrollHeight > measure.clientHeight + 1;

			t.vert.node.style.display = needsV ? 'block' : 'none';
			t.horiz.node.style.display = needsH ? 'block' : 'none';

			if (needsV) {
				t.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0));
				t.vert.node.style.bottom = needsH ? width + 'px' : '0';
			}

			if (needsH) {
				t.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
				t.horiz.node.style.right = needsV ? width + 'px' : '0';
				t.horiz.node.style.left = measure.barLeft + 'px';
			}

			return {right: needsV ? width : 0, bottom: needsH ? width : 0};
		};

		SimpleScrollbars.prototype.setScrollTop = function(pos) {
			this.vert.setPos(pos);
		};

		SimpleScrollbars.prototype.setScrollLeft = function(pos) {
			this.horiz.setPos(pos);
		};

		SimpleScrollbars.prototype.clear = function() {
			var parent = this.horiz.node.parentNode;
			parent.removeChild(this.horiz.node);
			parent.removeChild(this.vert.node);
		};

		CodeMirror.scrollbarModel.simple = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-simplescroll', place, scroll);
		};
		CodeMirror.scrollbarModel.overlay = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-overlayscroll', place, scroll);
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {
		CodeMirror.defineOption('showTrailingSpace', false, function(cm, val, prev) {
			if (prev == CodeMirror.Init)
				prev = false;
			if (prev && !val)
				cm.removeOverlay('trailingspace');
			else if (!prev && val) {
				cm.addOverlay({ token: function(stream) {
					for (var l = stream.string.length, i = l; i; --i) {
						if (stream.string.charCodeAt(i - 1) !== 32)
							break;
					}
					if (i > stream.pos) {
						stream.pos = i;
						return null;
					}
					stream.pos = l;
					return 'trailingspace';
				}, name: 'trailingspace' });
			}
		});
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		CodeMirror.defineOption('scrollPastEnd', false, function(cm, val, old) {
			if (old && old != CodeMirror.Init) {
				cm.off('change', onChange);
				cm.off('refresh', updateBottomMargin);
				cm.display.lineSpace.parentNode.style.paddingBottom = '';
				cm.state.scrollPastEndPadding = null;
			}
			if (val) {
				cm.on('change', onChange);
				cm.on('refresh', updateBottomMargin);
				updateBottomMargin(cm);
			}
		});

		function onChange(cm, change) {
			if (CodeMirror.changeEnd(change).line == cm.lastLine())
				updateBottomMargin(cm);
		}

		function updateBottomMargin(cm) {
			var padding = '';

			if (cm.lineCount() > 1) {
				var totalH = cm.display.scroller.clientHeight - 30;
				var lastLineH = cm.getLineHandle(cm.lastLine()).height;
				padding = (totalH - lastLineH) + 'px';
			}

			if (cm.state.scrollPastEndPadding != padding) {
				cm.state.scrollPastEndPadding = padding;
				cm.display.lineSpace.parentNode.style.paddingBottom = padding;
				cm.off('refresh', updateBottomMargin);
				cm.setSize();
				cm.on('refresh', updateBottomMargin);
			}

		}
	});

	next();
}]);

COMPONENT('form', 'zindex:12;scrollbar:1;closeoutside:0', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container;
	var csspos = {};

	if (!W.$$form) {

		W.$$form_level = W.$$form_level || 1;
		W.$$form = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			setTimeout2('form', function() {
				for (var i = 0; i < M.components.length; i++) {
					var com = M.components[i];
					if (com.name === 'form' && !HIDDEN(com.dom) && com.$ready && !com.$removed)
						com.resize();
				}
			}, 200);
		};

		if (W.OP)
			W.OP.on('resize', resize);
		else
			$(W).on('resize', resize);

		$(document).on('click', cls2 + '-container', function(e) {

			var el = $(e.target);
			if (e.target === this || el.hclass(cls + '-container-padding')) {
				var com = $(this).component();
				if (com && com.config.closeoutside) {
					com.set('');
					return;
				}
			}

			if (!(el.hclass(cls + '-container-padding') || el.hclass(cls + '-container')))
				return;

			var form = $(this).find(cls2);
			var c = cls + '-animate-click';
			form.aclass(c);

			setTimeout(function() {
				form.rclass(c);
			}, 300);
		});
	}

	self.readonly();
	self.submit = function() {
		if (config.submit)
			EXEC(config.submit, self.hide, self.element);
		else
			self.hide();
	};

	self.cancel = function() {
		config.cancel && EXEC(config.cancel, self.hide);
		self.hide();
	};

	self.hide = function() {
		self.set('');
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass(value.icon.indexOf(' ') === -1 ? ('fa fa-' + value.icon) : value.icon);
		el.tclass('hidden', !value.icon);
	};

	self.resize = function() {

		if (self.scrollbar) {
			container.css('height', WH);
			self.scrollbar.resize();
		}

		if (!config.center || self.hclass('hidden'))
			return;

		var ui = self.find(cls2);
		var fh = ui.innerHeight();
		var wh = WH;
		var r = (wh / 2) - (fh / 2);
		csspos.marginTop = (r > 30 ? (r - 15) : 20) + 'px';
		ui.css(csspos);
	};

	self.make = function() {

		$(document.body).append('<div id="{0}" class="hidden {4}-container invisible"><div class="{4}-scrollbar"><div class="{4}-container-padding"><div class="{4}" style="max-width:{1}px"><div data-bind="@config__text span:value.title__change .{4}-icon:@icon" class="{4}-title"><button name="cancel" class="{4}-button-close{3}" data-path="{2}"><i class="fa fa-times"></i></button><i class="{4}-icon"></i><span></span></div></div></div></div>'.format(self.ID, config.width || 800, self.path, config.closebutton == false ? ' hidden' : '', cls));

		var scr = self.find('> script');
		self.template = scr.length ? scr.html().trim() : '';
		if (scr.length)
			scr.remove();

		var el = $('#' + self.ID);
		var body = el.find(cls2)[0];
		container = el.find(cls2 + '-scrollbar');

		if (config.scrollbar) {
			el.css('overflow', 'hidden');
			self.scrollbar = SCROLLBAR(el.find(cls2 + '-scrollbar'), { visibleY: 1, orientation: 'y' });
		}

		while (self.dom.children.length)
			body.appendChild(self.dom.children[0]);

		self.rclass('hidden invisible');
		self.replace(el, true);

		self.event('scroll', function() {
			EMIT('scroll', self.name);
			EMIT('reflow', self.name);
		});

		self.event('click', 'button[name]', function() {
			var t = this;
			switch (t.name) {
				case 'submit':
					self.submit(self.hide);
					break;
				case 'cancel':
					!t.disabled && self[t.name](self.hide);
					break;
			}
		});

		config.enter && self.event('keydown', 'input', function(e) {
			e.which === 13 && !self.find('button[name="submit"]')[0].disabled && setTimeout(self.submit, 800);
		});
	};

	self.configure = function(key, value, init, prev) {
		if (init)
			return;
		switch (key) {
			case 'width':
				value !== prev && self.find(cls2).css('max-width', value + 'px');
				break;
			case 'closebutton':
				self.find(cls2 + '-button-close').tclass('hidden', value !== true);
				break;
		}
	};

	self.setter = function(value) {

		setTimeout2(cls + '-noscroll', function() {
			$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
		}, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden) {
			if (!isHidden) {
				config.reload && EXEC(config.reload, self);
				config.default && DEFAULT(config.default, true);
			}
			return;
		}

		setTimeout2(cls, function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$form_level--;
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find(cls2).append(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$form_level < 1)
			W.$$form_level = 1;

		W.$$form_level++;

		self.css('z-index', W.$$form_level * config.zindex);
		self.element.scrollTop(0);
		self.rclass('hidden');

		self.resize();
		self.release(false);

		config.reload && EXEC(config.reload, self);
		config.default && DEFAULT(config.default, true);

		if (!isMOBILE && config.autofocus) {
			setTimeout(function() {
				self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
			}, 1000);
		}

		setTimeout(function() {
			self.rclass('invisible');
			self.element.scrollTop(0);
			self.find(cls2).aclass(cls + '-animate');
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.ID, function() {
			self.css('z-index', (W.$$form_level * config.zindex) + 1);
		}, 500);
	};
});

COMPONENT('menu', function(self, config, cls) {

	self.singleton();
	self.readonly();
	self.nocompile && self.nocompile();

	var cls2 = '.' + cls;

	var is = false;
	var issubmenu = false;
	var isopen = false;
	var events = {};
	var ul, children, prevsub, parentclass;

	self.make = function() {
		self.aclass(cls + ' hidden ' + cls + '-style-' + (config.style || 1));
		self.append('<div class="{0}-items"><ul></ul></div><div class="{0}-submenu hidden"><ul></ul></div>'.format(cls));
		ul = self.find(cls2 + '-items').find('ul');
		children = self.find(cls2 + '-submenu');

		self.event('click', 'li', function(e) {

			clearTimeout2(self.ID);

			var el = $(this);
			if (!el.hclass(cls + '-divider') && !el.hclass(cls + '-disabled')) {
				self.opt.scope && M.scope(self.opt.scope);
				var index = el.attrd('index').split('-');
				if (index.length > 1) {
					// submenu
					self.opt.callback(self.opt.items[+index[0]].children[+index[1]]);
					self.hide();
				} else if (!issubmenu) {
					self.opt.callback(self.opt.items[+index[0]]);
					self.hide();
				}
			}

			e.preventDefault();
			e.stopPropagation();
		});

		events.hide = function() {
			is && self.hide();
		};

		self.event('scroll', events.hide);
		self.on('reflow + scroll + resize + resize2', events.hide);

		events.click = function(e) {
			if (is && !isopen && (!self.target || (self.target !== e.target && !self.target.contains(e.target))))
				setTimeout2(self.ID, self.hide, isMOBILE ? 700 : 300);
		};

		events.hidechildren = function() {
			if ($(this.parentNode.parentNode).hclass(cls + '-items')) {
				if (prevsub && prevsub[0] !== this) {
					prevsub.rclass(cls + '-selected');
					prevsub = null;
					children.aclass('hidden');
					issubmenu = false;
				}
			}
		};

		events.children = function() {

			if (prevsub && prevsub[0] !== this) {
				prevsub.rclass(cls + '-selected');
				prevsub = null;
			}

			issubmenu = true;
			isopen = true;

			setTimeout(function() {
				isopen = false;
			}, 500);

			var el = prevsub = $(this);
			var index = +el.attrd('index');
			var item = self.opt.items[index];

			el.aclass(cls + '-selected');

			var html = self.makehtml(item.children, index);
			children.find('ul').html(html);
			children.rclass('hidden');

			var css = {};
			var offset = el.position();

			css.left = ul.width() - 5;
			css.top = offset.top - 5;

			var offsetX = offset.left;

			offset = self.element.offset();

			var w = children.width();
			var left = offset.left + css.left + w;
			if (left > WW + 30)
				css.left = (offsetX - w) + 5;

			children.css(css);
		};
	};

	self.bindevents = function() {
		events.is = true;
		$(document).on('touchstart mouseenter mousedown', cls2 + '-children', events.children).on('touchstart mousedown', events.click);
		$(W).on('scroll', events.hide);
		self.element.on('mouseenter', 'li', events.hidechildren);
	};

	self.unbindevents = function() {
		events.is = false;
		$(document).off('touchstart mouseenter mousedown', cls2 + '-children', events.children).off('touchstart mousedown', events.click);
		$(W).off('scroll', events.hide);
		self.element.off('mouseenter', 'li', events.hidechildren);
	};

	self.showxy = function(x, y, items, callback) {
		var opt = {};
		opt.x = x;
		opt.y = y;
		opt.items = items;
		opt.callback = callback;
		self.show(opt);
	};

	self.makehtml = function(items, index) {
		var builder = [];
		var tmp;

		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			if (typeof(item) === 'string') {
				// caption or divider
				if (item === '-')
					tmp = '<hr />';
				else
					tmp = '<span>{0}</span>'.format(item);
				builder.push('<li class="{0}-divider">{1}</li>'.format(cls, tmp));
				continue;
			}

			var cn = item.classname || '';
			var icon = '';

			if (item.icon)
				icon = '<i class="{0}"></i>'.format(item.icon.charAt(0) === '!' ? item.icon.substring(1) : item.icon.indexOf('fa-') === -1 ? ('fa fa-' + item.icon) : item.icon);
			else
				cn = (cn ? (cn + ' ') : '') + cls + '-nofa';

			tmp = '';

			if (index == null && item.children && item.children.length) {
				cn += (cn ? ' ' : '') + cls + '-children';
				tmp += '<i class="fa fa-play pull-right"></i>';
			}

			if (item.selected)
				cn += (cn ? ' ' : '') + cls + '-selected';

			if (item.disabled)
				cn += (cn ? ' ' : '') + cls + '-disabled';

			tmp += '<div class="{0}-name">{1}{2}{3}</div>'.format(cls, icon, item.name, item.shortcut ? '<b>{0}</b>'.format(item.shortcut) : '');

			if (item.note)
				tmp += '<div class="ui-menu-note">{0}</div>'.format(item.note);

			builder.push('<li class="{0}" data-index="{2}">{1}</li>'.format(cn, tmp, (index != null ? (index + '-') : '') + i));
		}

		return builder.join('');
	};

	self.show = function(opt) {

		if (typeof(opt) === 'string') {
			// old version
			opt = { align: opt };
			opt.element = arguments[1];
			opt.items = arguments[2];
			opt.callback = arguments[3];
			opt.offsetX = arguments[4];
			opt.offsetY = arguments[5];
		}

		var tmp = opt.element ? opt.element instanceof jQuery ? opt.element[0] : opt.element.element ? opt.element.dom : opt.element : null;

		if (is && tmp && self.target === tmp) {
			self.hide();
			return;
		}

		var tmp;

		self.target = tmp;
		self.opt = opt;
		opt.scope = M.scope();

		if (parentclass && opt.classname !== parentclass) {
			self.rclass(parentclass);
			parentclass = null;
		}

		if (opt.large)
			self.aclass('ui-large');
		else
			self.rclass('ui-large');

		isopen = false;
		issubmenu = false;
		prevsub = null;

		var css = {};
		children.aclass('hidden');
		children.find('ul').empty();
		clearTimeout2(self.ID);

		ul.html(self.makehtml(opt.items));

		if (!parentclass && opt.classname) {
			self.aclass(opt.classname);
			parentclass = opt.classname;
		}

		if (is) {
			css.left = 0;
			css.top = 0;
			self.element.css(css);
		} else {
			self.rclass('hidden');
			self.aclass(cls + '-visible', 100);
			is = true;
			if (!events.is)
				self.bindevents();
		}

		var target = $(opt.element);
		var w = self.width();
		var offset = target.offset();

		if (opt.element) {
			switch (opt.align) {
				case 'center':
					css.left = Math.ceil((offset.left - w / 2) + (target.innerWidth() / 2));
					break;
				case 'right':
					css.left = (offset.left - w) + target.innerWidth();
					break;
				default:
					css.left = offset.left;
					break;
			}

			css.top = opt.position === 'bottom' ? (offset.top - self.element.height() - 10) : (offset.top + target.innerHeight() + 10);

		} else {
			css.left = opt.x;
			css.top = opt.y;
		}

		if (opt.offsetX)
			css.left += opt.offsetX;

		if (opt.offsetY)
			css.top += opt.offsetY;

		var mw = w;
		var mh = self.height();

		if (css.left < 0)
			css.left = 10;
		else if ((mw + css.left) > WW)
			css.left = (WW - mw) - 10;

		if (css.top < 0)
			css.top = 10;
		else if ((mh + css.top) > WH)
			css.top = (WH - mh) - 10;

		self.element.css(css);
	};

	self.hide = function() {
		events.is && self.unbindevents();
		is = false;
		self.opt && self.opt.hide && self.opt.hide();
		self.target = null;
		self.opt = null;
		self.aclass('hidden');
		self.rclass(cls + '-visible');
	};

});

COMPONENT('message', 'button:OK', function(self, config, cls) {

	var cls2 = '.' + cls;
	var is, visible = false;
	var events = {};

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		var pls = (config.style === 2 ? (' ' + cls + '2') : '');
		self.aclass(cls + ' hidden' + pls);
		self.event('click', 'button', self.hide);
	};

	events.keyup = function(e) {
		if (e.which === 27)
			self.hide();
	};

	events.bind = function() {
		if (!events.is) {
			$(W).on('keyup', events.keyup);
			events.is = false;
		}
	};

	events.unbind = function() {
		if (events.is) {
			events.is = false;
			$(W).off('keyup', events.keyup);
		}
	};

	self.warning = function(message, icon, fn) {
		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}
		self.callback = fn;
		self.content(cls + '-warning', message, icon || 'warning');
	};

	self.info = function(message, icon, fn) {
		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}
		self.callback = fn;
		self.content(cls + '-info', message, icon || 'info-circle');
	};

	self.success = function(message, icon, fn) {

		if (typeof(icon) === 'function') {
			fn = icon;
			icon = undefined;
		}

		self.callback = fn;
		self.content(cls + '-success', message, icon || 'check-circle');
	};

	self.response = function(message, callback, response) {

		var fn;

		if (typeof(message) === 'function') {
			response = callback;
			fn = message;
			message = null;
		} else if (typeof(callback) === 'function')
			fn = callback;
		else {
			response = callback;
			fn = null;
		}

		if (response instanceof Array) {
			var builder = [];
			for (var i = 0; i < response.length; i++) {
				var err = response[i].error;
				err && builder.push(err);
			}
			self.warning(builder.join('<br />'));
			SETTER('!loading/hide');
		} else if (typeof(response) === 'string') {
			self.warning(response);
			SETTER('!loading/hide');
		} else {
			message && self.success(message);
			fn && fn(response);
		}
	};

	self.hide = function() {
		events.unbind();
		self.callback && self.callback();
		self.aclass('hidden');
		visible = false;
	};

	self.content = function(classname, text, icon) {

		if (icon.indexOf(' ') === -1)
			icon = 'fa fa-' + icon;

		!is && self.html('<div><div class="{0}-icon"><i class="{1}"></i></div><div class="{0}-body"><div class="{0}-text"></div><hr /><button>{2}</button></div></div>'.format(cls, icon, config.button));
		visible = true;
		self.rclass2(cls + '-').aclass(classname);
		self.find(cls2 + '-body').rclass().aclass(cls + '-body');

		if (is)
			self.find(cls2 + '-icon').find('.fa').rclass2('fa').aclass(icon);

		self.find(cls2 + '-text').html(text);
		self.rclass('hidden');
		is = true;
		events.bind();
		setTimeout(function() {
			self.aclass(cls + '-visible');
			setTimeout(function() {
				self.find(cls2 + '-icon').aclass(cls + '-icon-animate');
			}, 300);
		}, 100);
	};
});

COMPONENT('validation', 'delay:100;flags:visible', function(self, config, cls) {

	var path, elements = null;
	var def = 'button[name="submit"]';
	var flags = null;
	var tracked = false;
	var reset = 0;
	var old, track;

	self.readonly();

	self.make = function() {
		elements = self.find(config.selector || def);
		path = self.path.replace(/\.\*$/, '');
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'selector':
				if (!init)
					elements = self.find(value || def);
				break;
			case 'flags':
				if (value) {
					flags = value.split(',');
					for (var i = 0; i < flags.length; i++)
						flags[i] = '@' + flags[i];
				} else
					flags = null;
				break;
			case 'track':
				track = value.split(',').trim();
				break;
		}
	};

	var settracked = function() {
		tracked = 0;
	};

	self.setter = function(value, path, type) {

		var is = path === self.path || path.length < self.path.length;

		if (reset !== is) {
			reset = is;
			self.tclass(cls + '-modified', !reset);
		}

		if ((type === 1 || type === 2) && track && track.length) {
			for (var i = 0; i < track.length; i++) {
				if (path.indexOf(track[i]) !== -1) {
					tracked = 1;
					return;
				}
			}
			if (tracked === 1) {
				tracked = 2;
				setTimeout(settracked, config.delay * 3);
			}
		}
	};

	var check = function() {
		var disabled = tracked ? !VALID(path, flags) : DISABLED(path, flags);
		if (!disabled && config.if)
			disabled = !EVALUATE(self.path, config.if);
		if (disabled !== old) {
			elements.prop('disabled', disabled);
			self.tclass(cls + '-ok', !disabled);
			self.tclass(cls + '-no', disabled);
			old = disabled;
		}
	};

	self.state = function(type, what) {
		if (type === 3 || what === 3)
			tracked = 0;
		setTimeout2(self.ID, check, config.delay);
	};

});

COMPONENT('checkbox', function(self, config, cls) {

	self.nocompile && self.nocompile();

	self.validate = function(value) {
		return (config.disabled || !config.required) ? true : (value === true || value === 'true' || value === 'on');
	};

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'label':
				self.find('span').html(value);
				break;
			case 'required':
				self.find('span').tclass(cls + '-label-required', value);
				break;
			case 'disabled':
				self.tclass('ui-disabled', value);
				break;
			case 'checkicon':
				self.find('i').rclass2('fa-').aclass('fa-' + value);
				break;
		}
	};

	self.make = function() {
		self.aclass(cls);
		self.html('<div><i class="fa fa-{2}"></i></div><span{1}>{0}</span>'.format(config.label || self.html(), config.required ? (' class="' + cls + '-label-required"') : '', config.checkicon || 'check'));
		config.disabled && self.aclass('ui-disabled');
		self.event('click', function() {
			if (!config.disabled) {
				self.dirty(false);
				self.getter(!self.get());
			}
		});
	};

	self.setter = function(value) {
		var is = config.reverse ? !value : !!value;
		self.tclass(cls + '-checked', is);
	};
});

COMPONENT('table', 'highlight:true;unhighlight:true;multiple:false;pk:id;visibleY:1;scrollbar:0;pluralizepages:# pages,# page,# pages,# pages;pluralizeitems:# items,# item,# items,# items;margin:0', function(self, config, cls) {

	var cls2 = '.' + cls;
	var etable, ebody, eempty, ehead, eheadsize, efooter, container;
	var opt = { selected: [] };
	var templates = {};
	var sizes = {};
	var names = {};
	var aligns = {};
	var sorts = {};
	var dcompile = false;
	var prevsort;
	var prevhead;
	var extradata;

	self.readonly();
	self.nocompile();
	self.bindvisible();

	self.make = function() {

		self.aclass(cls + ' invisible' + (config.detail ? (' ' + cls + '-detailed') : '') + ((config.highlight || config.click || config.exec) ? (' ' + cls + '-selectable') : '') + (config.border ? (' ' + cls + '-border') : '') + (config.flat ? (' ' + cls + '-flat') : ''));

		self.find('script').each(function() {

			var el = $(this);
			var type = el.attrd('type');

			switch (type) {
				case 'detail':
					var h = el.html();
					dcompile = h.COMPILABLE();
					templates.detail = Tangular.compile(h);
					return;
				case 'empty':
					templates.empty = el.html();
					return;
			}

			var display = (el.attrd('display') || '').toLowerCase();
			var template = Tangular.compile(el.html());
			var size = (el.attrd('size') || '').split(',');
			var name = (el.attrd('head') || '').split(',');
			var align = (el.attrd('align') || '').split(',');
			var sort = (el.attrd('sort') || '').split(',');
			var i;

			for (i = 0; i < align.length; i++) {
				switch (align[i].trim()) {
					case '0':
						align[i] = 'left';
						break;
					case '1':
						align[i] = 'center';
						break;
					case '2':
						align[i] = 'right';
						break;
				}
			}

			display = (display || '').split(',').trim();

			for (i = 0; i < align.length; i++)
				align[i] = align[i].trim();

			for (i = 0; i < size.length; i++)
				size[i] = size[i].trim().toLowerCase();

			for (i = 0; i < sort.length; i++)
				sort[i] = sort[i].trim();

			for (i = 0; i < name.length; i++) {
				name[i] = name[i].trim().replace(/'[a-z-\s]+'/, function(val) {
					if (val.indexOf(' ') === -1)
						val = val + ' fa';
					return '<i class="fa-{0}"></i>'.format(val.replace(/'/g, ''));
				});
			}

			if (!size[0] && size.length === 1)
				size = EMPTYARRAY;

			if (!align[0] && align.length === 1)
				align = EMPTYARRAY;

			if (!name[0] && name.length === 1)
				name = EMPTYARRAY;

			if (display.length) {
				for (i = 0; i < display.length; i++) {
					templates[display[i]] = template;
					sizes[display[i]] = size.length ? size : null;
					names[display[i]] = name.length ? name : null;
					aligns[display[i]] = align.length ? align : null;
					sorts[display[i]] = sort.length ? sort : null;
				}
			} else {
				templates.lg = templates.md = templates.sm = templates.xs = template;
				sizes.lg = sizes.md = sizes.sm = sizes.xs = size.length ? size : null;
				names.lg = names.md = names.sm = names.xs = name.length ? name : null;
				sorts.lg = sorts.md = sorts.sm = sorts.xs = sort.length ? sort : null;
				aligns.lg = aligns.md = aligns.sm = aligns.xs = align.length ? align : null;
			}
		});

		self.html('<div class="{0}-headcontainer"><table class="{0}-head"><thead></thead></table></div><div class="{0}-container"><table class="{0}-table"><thead></thead><tbody class="{0}-tbody"></tbody></table><div class="{0}-empty hidden"></div></div>'.format(cls));
		etable = self.find(cls2 + '-table');
		ebody = etable.find('tbody');
		eempty = self.find(cls2 + '-empty').html(templates.empty || '');
		ehead = self.find(cls2 + '-head thead');
		eheadsize = etable.find('thead');
		container = self.find(cls2 + '-container');

		etable.on('click', 'button', function() {
			if (config.click) {
				var btn = $(this);
				var row = opt.items[+btn.closest('tr').attrd('index')];
				SEEX(self.makepath(config.click), btn[0].name, row, btn);
			}
		});

		if (config.paginate) {
			self.append('<div class="{0}-footer"><div class={0}-pagination-items hidden-xs"></div><div class="{0}-pagination"><button name="page-first" disabled><i class="fa fa-angle-double-left"></i></button><button name="page-prev" disabled><i class="fa fa-angle-left"></i></button><div><input type="text" name="page" maxlength="5" class="{0}-pagination-input" /></div><button name="page-next" disabled><i class="fa fa-angle-right"></i></button><button name="page-last" disabled><i class="fa fa-angle-double-right"></i></button></div><div class="{0}-pagination-pages"></div></div>'.format(cls));
			efooter = self.find(cls2 + '-footer');

			efooter.on('change', cls2 + '-pagination-input', function() {

				var value = self.get();
				var val = +this.value;

				if (isNaN(val))
					return;

				if (val >= value.pages)
					val = value.pages;
				else if (val < 1)
					val = 1;

				value.page = val;
			});

			efooter.on('click', 'button', function() {
				var data = self.get();

				var model = {};
				model.page = data.page;
				model.limit = data.limit;

				if (prevsort)
					model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';

				switch (this.name) {
					case 'page-first':
						model.page = 1;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-last':
						model.page = data.pages;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-prev':
						model.page -= 1;
						SEEX(self.makepath(config.paginate), model);
						break;
					case 'page-next':
						model.page += 1;
						SEEX(self.makepath(config.paginate), model);
						break;
				}
			});
		}

		if (config.scrollbar) {
			self.scrollbar = SCROLLBAR(container, { visibleY: !!config.visibleY });
			ehead.parent().parent().aclass(cls + '-scrollbar');
		}

		templates.empty && templates.empty.COMPILABLE() && COMPILE(eempty);

		self.event('click', '.sort', function() {

			var th = $(this);
			var i = th.find('i');
			var type;

			if (i.attr('class') === 'fa') {
				// no sort
				prevsort && prevsort.el.find('i').rclass2('fa-');
				i.aclass('fa-long-arrow-up');
				type = 'asc';
			} else if (i.hclass('fa-long-arrow-up')) {
				// ascending
				i.rclass('fa-long-arrow-up').aclass('fa-long-arrow-down');
				type = 'desc';
			} else if (i.hclass('fa-long-arrow-down')) {
				// descending
				i.rclass('fa-long-arrow-down');
				type = '';
			}

			var index = th.index();
			var data = self.get();

			prevsort = { index: index, type: type, el: th, name: sorts[WIDTH()][index] };

			if (config.paginate) {
				var model = {};
				model.page = data.page;
				model.limit = data.limit;
				model.sort = type ? (prevsort.name + '_' + type) : undefined;
				SEEX(self.makepath(config.paginate), model);
			} else if (prevsort.name) {
				opt.items = (data.items ? data.items : data).slice(0);
				if (type)
					opt.items.quicksort(prevsort.name, type === 'asc');
				else {
					var tmp = self.get() || EMPTYARRAY;
					opt.items = tmp.items ? tmp.items : tmp;
					prevsort = null;
				}
				opt.sort = type ? (prevsort.name + '_' + type) : undefined;
				config.filter && EXEC(self.makepath(config.filter), opt, 'sort');
				self.redraw();
			}
		});

		var blacklist = { A: 1, BUTTON: 1 };
		var dblclick = 0;

		var forceselect = function(el, index, is) {

			if (!config.highlight) {
				config.exec && SEEX(self.makepath(config.exec), opt.items[index], el);
				return;
			}

			if (config.multiple) {
				if (is) {
					if (config.unhighlight) {
						el.rclass(cls + '-selected');
						config.detail && self.row_detail(el);
						opt.selected = opt.selected.remove(index);
						config.exec && SEEX(self.makepath(config.exec), self.selected(), el);
					}
				} else {
					el.aclass(cls + '-selected');
					config.exec && SEEX(self.makepath(config.exec), self.selected(), el);
					config.detail && self.row_detail(el);
					opt.selected.push(index);
				}
			} else {

				if (is && !config.unhighlight)
					return;

				if (opt.selrow) {
					opt.selrow.rclass(cls + '-selected');
					config.detail && self.row_detail(opt.selrow);
					opt.selrow = null;
					opt.selindex = -1;
				}

				// Was selected
				if (is) {
					config.exec && SEEX(self.makepath(config.exec));
					return;
				}

				opt.selindex = index;
				opt.selrow = el;
				el.aclass(cls + '-selected');
				config.exec && SEEX(self.makepath(config.exec), opt.items[index], el);
				config.detail && self.row_detail(el);
			}
		};

		ebody.on('click', '> tr', function(e) {

			var el = $(this);
			var node = e.target;

			if (blacklist[node.tagName] || (node.tagName === 'SPAN' && node.getAttribute('class') || '').indexOf('link') !== -1)
				return;

			if (node.tagName === 'I') {
				var parent = $(node).parent();
				if (blacklist[parent[0].tagName] || (parent[0].tagName === 'SPAN' && parent.hclass('link')))
					return;
			}

			var now = Date.now();
			var isdblclick = dblclick ? (now - dblclick) < 250 : false;
			dblclick = now;

			var index = +el.attrd('index');
			if (index > -1) {

				var is = el.hclass(cls + '-selected');

				if (isdblclick && config.dblclick && is) {
					self.forceselectid && clearTimeout(self.forceselectid);
					SEEX(self.makepath(config.dblclick), opt.items[index], el);
					return;
				}

				self.forceselectid && clearTimeout(self.forceselectid);
				self.forceselectid = setTimeout(forceselect, config.dblclick ? is ? 250 : 1 : 1, el, index, is);
			}
		});

		var resize = function() {
			setTimeout2(self.ID, self.resize, 500);
		};

		$(W).on('resize', resize);
	};

	self.resize2 = function() {
		self.scrollbar && setTimeout2(self.ID + 'scrollbar', self.scrollbar.resize, 300);
	};

	self.resize = function() {

		var display = WIDTH();
		if (display !== opt.display && sizes[display] && sizes[display] !== sizes[opt.display]) {
			self.refresh();
			return;
		}

		if (config.height > 0)
			self.find(cls2 + '-container').css('height', config.height - config.margin);
		else if (config.height) {
			var el = self.parent(config.height);
			var header = self.find(cls2 + '-head');
			var footer = config.paginate ? (self.find(cls2 + '-footer').height() + 2) : 0;
			self.find(cls2 + '-container').css('height', el.height() - header.height() - footer - 2 - config.margin);
		}

		self.scrollbar && self.scrollbar.resize();
	};

	self.row_detail = function(el) {

		var index = +el.attrd('index');
		var row = opt.items[index];
		var eld = el.next();

		if (el.hclass(cls + '-selected')) {

			// Row is selected
			if (eld.hclass(cls + '-detail')) {
				// Detail exists
				eld.rclass('hidden');
			} else {

				// Detail doesn't exist
				el.after('<tr class="{0}-detail"><td colspan="{1}" data-index="{2}"></td></tr>'.format(cls, el.find('td').length, index));
				eld = el.next();

				var tmp;

				if (config.detail === true) {
					tmp = eld.find('td');
					tmp.html(templates.detail(row, { index: index, user: window.user, data: extradata }));
					dcompile && COMPILE(tmp);
				} else {
					tmp = eld.find('td');
					EXEC(self.makepath(config.detail), row, function(row) {
						var is = typeof(row) === 'string';
						tmp.html(is ? row : templates.detail(row, { index: index, user: window.user, data: extradata }));
						if ((is && row.COMPILABLE()) || dcompile)
							COMPILE(tmp);
					}, tmp);
				}
			}

		} else
			eld.hclass(cls + '-detail') && eld.aclass('hidden');

		self.resize2();
	};

	self.redrawrow = function(index, row) {

		if (typeof(index) === 'number')
			index = ebody.find('tr[data-index="{0}"]'.format(index));

		if (index.length) {
			var template = templates[opt.display];
			var indexer = {};
			indexer.data = extradata;
			indexer.user = W.user;
			indexer.index = +index.attrd('index');
			var is = index.hclass(cls + '-selected');
			var next = index.next();
			index.replaceWith(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
			next.hclass(cls + '-detail') && next.remove();
			is && ebody.find('tr[data-index="{0}"]'.format(indexer.index)).trigger('click');
		}
	};

	self.appendrow = function(row) {

		var index = opt.items.indexOf(row);
		if (index == -1)
			index = opt.items.push(row) - 1;

		var template = templates[opt.display];
		var indexer = {};
		indexer.data = extradata;
		indexer.user = W.user;
		indexer.index = index;
		ebody.append(template(row, indexer).replace('<tr', '<tr data-index="' + indexer.index + '"'));
	};

	self.removerow = function(row) {
		var index = opt.items.indexOf(row);
		if (index == -1)
			return;
		opt.selected = opt.selected.remove(index);
		opt.items.remove(row);
	};

	self.redraw = function() {
		var clsh = 'hidden';
		var count = 0;
		var indexer = { user: W.user, data: extradata };
		var builder = [];
		var template = templates[WIDTH()];
		if (template) {
			for (var i = 0; i < opt.items.length; i++) {
				var item = opt.items[i];
				count++;
				indexer.index = i;
				builder.push(template(item, indexer).replace('<tr', '<tr data-index="' + i + '"'));
			}
		}
		count && ebody.html(builder.join(''));
		eempty.tclass(clsh, count > 0);
		etable.tclass(clsh, count == 0);
		config.redraw && EXEC(self.makepath(config.redraw), self);
	};

	self.redrawpagination = function() {

		if (!config.paginate)
			return;

		var value = self.get();
		efooter.find('button').each(function() {

			var el = $(this);
			var dis = true;

			switch (this.name) {
				case 'page-next':
					dis = value.page >= value.pages;
					break;
				case 'page-prev':
					dis = value.page === 1;
					break;
				case 'page-last':
					dis = !value.pages || value.page === value.pages;
					break;
				case 'page-first':
					dis = value.page === 1;
					break;
			}

			el.prop('disabled', dis);
		});

		efooter.find('input')[0].value = value.page;
		efooter.find(cls2 + '-pagination-pages')[0].innerHTML = value.pages.pluralize.apply(value.pages, config.pluralizepages);
		efooter.find(cls2 + '-pagination-items')[0].innerHTML = value.count.pluralize.apply(value.count, config.pluralizeitems);
	};

	self.selected = function() {
		var rows = [];
		for (var i = 0; i < opt.selected.length; i++) {
			var row = opt.items[opt.selected[i]];
			row && rows.push(row);
		}
		return rows;
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'pluralizepages':
				config.pluralizepages = value.split(',').trim();
				break;
			case 'pluralizeitems':
				config.pluralizeitems = value.split(',').trim();
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
			case 'paginate':
			case 'exec':
			case 'click':
			case 'filter':
			case 'redraw':
				if (value && value.SCOPE)
					config[key] = value.SCOPE(self, value);
				break;
		}
	};

	self.bind = function(path, val) {
		extradata = val;
	};

	self.setter = function(value) {

		if (config.paginate && value == null) {
			var model = {};
			model.page = 1;
			if (prevsort)
				model.sort = prevsort && prevsort.type ? (prevsort.name + '_' + prevsort.type) : '';
			EXEC(self.makepath(config.paginate), model);
			return;
		}

		var data = value ? value.items ? value.items : value : value;
		var empty = !data || !data.length;
		var clsh = 'hidden';

		if (!self.isinit) {
			self.rclass('invisible', 10);
			self.isinit = true;
		}

		var display = WIDTH();
		var builder = [];
		var buildersize = [];
		var selected = opt.selected.slice(0);

		for (var i = 0; i < selected.length; i++) {
			var row = opt.items[selected[i]];
			selected[i] = row[config.pk];
		}

		var size = sizes[display];
		var name = names[display];
		var align = aligns[display];
		var sort = sorts[display];

		if (prevhead !== display) {
			if ((size && size.length) || (name && name.length) || (align && align.length)) {

				var arr = name || size || align;

				for (var i = 0; i < arr.length; i++) {
					var w = !size || size[i] === '0' ? 'auto' : size[i];
					builder.push('<th style="width:{0};text-align:{2}"{3}>{1}</th>'.format(w, (sort && sort[i] ? '<i class="fa"></i>' : '') + (name ? name[i] : ''), align ? align[i] : 'left', sort && sort[i] ? ' class="sort"' : ''));
					buildersize.push('<th style="width:{0}"></th>'.format(w));
				}

				ehead.parent().tclass('hidden', !name);
				ehead.html('<tr>{0}</tr>'.format(builder.join('')));
				eheadsize.html('<tr>{0}</tr>'.format(buildersize.join('')));

			} else
				ehead.html('');

			prevsort = null;
			prevhead = display;
		}

		setTimeout(self.resize, 100);

		opt.display = display;
		opt.items = data ? data.slice(0) : 0;
		opt.data = value;
		opt.selindex = -1;
		opt.selrow = null;
		opt.selected = [];
		opt.sort = prevsort;

		self.redrawpagination();
		config.filter && EXEC(self.makepath(config.filter), opt, 'refresh');
		config.exec && SEEX(self.makepath(config.exec), config.multiple ? [] : null);

		if (empty) {
			etable.aclass(clsh);
			eempty.rclass(clsh);
			return;
		}

		self.redraw();

		if (config.remember) {
			for (var i = 0; i < selected.length; i++) {
				if (selected[i]) {
					var index = opt.items.findIndex(config.pk, selected[i]);
					if (index !== -1)
						ebody.find('tr[data-index="{0}"]'.format(index)).trigger('click');
				}
			}
		}
	};

});

COMPONENT('checkboxlist', 'checkicon:check', function(self, config, cls) {

	var W = window;
	var cls2 = '.' + cls;

	!W.$checkboxlist && (W.$checkboxlist = Tangular.compile('<div{{ if $.class }} class="{{ $.class }}"{{ fi }}><div class="' + cls + '-item" data-index="{{ index }}"><div><i class="fa fa-{{ $.checkicon }}"></i></div><span>{{ text }}</span></div></div>'));

	var template = W.$checkboxlist;
	var container, data, datasource, content, dataold, render = null;

	self.nocompile && self.nocompile();

	self.validate = function(value) {
		return config.disabled || !config.required ? true : !!(value && value.length > 0);
	};

	self.configure = function(key, value, init) {

		if (init)
			return;

		var redraw = false;

		switch (key) {

			case 'type':
				self.type = value;
				break;

			case 'checkicon':
				self.find('i').rclass().aclass((value.indexOf(' ') === -1 ? 'fa fa-' : '') + value);
				break;

			case 'disabled':
				self.tclass('ui-disabled', value);
				self.reset();
				break;

			case 'datasource':
				self.datasource(value, self.bind);
				datasource && self.refresh();
				datasource = value;
				break;

			case 'icon':
				if (!self.find(cls2 + '-label').find('i').rclass().aclass((value.indexOf(' ') === -1 ? 'fa fa-' : '') + value).length)
					redraw = true;
				break;

			case 'required':
				self.tclass(cls + '-required', value);
				self.state(1, 1);
				break;

			case 'label':
				redraw = true;
				break;

			case 'items':

				if (value instanceof Array) {
					self.bind('', value);
					return;
				}

				var items = [];
				value.split(',').forEach(function(item) {
					item = item.trim().split('|');
					var val = (item[1] == null ? item[0] : item[1]).trim();
					if (config.type === 'number')
						val = +val;
					items.push({ name: item[0].trim(), id: val });
				});

				self.bind('', items);
				self.refresh();
				break;
		}

		redraw && setTimeout2(self.id + '.redraw', function() {
			self.redraw();
			self.bind('', dataold);
			self.refresh();
		}, 100);
	};

	self.make = function() {

		self.aclass(cls);
		content = self.html();
		config.type && (self.type = config.type);
		config.disabled && self.aclass('ui-disabled');
		self.redraw();

		if (config.items)
			self.reconfigure({ items: config.items });
		else if (config.datasource)
			self.reconfigure({ datasource: config.datasource });
		else
			self.bind('', null);

		self.event('click', cls2 + '-item', function(e) {

			e.stopPropagation();

			if (config.disabled)
				return;

			var el = $(this);
			var is = !el.hasClass(cls + '-checked');
			var index = +el.attrd('index');
			var value = data[index];

			if (value == null)
				return;

			value = value.value;

			var arr = self.get();
			if (!(arr instanceof Array))
				arr = [];

			index = arr.indexOf(value);

			if (is) {
				index === -1 && arr.push(value);
			} else {
				index !== -1 && arr.splice(index, 1);
			}

			self.reset(true);
			self.set(arr, 2);
			self.change();
		});
	};

	self.redraw = function() {

		var label = config.label || content;
		var icon = config.icon ? ((config.icon.indexOf(' ') === -1 ? 'fa fa-' : '') + config.icon) : '';

		self.tclass(cls + '-required', !!config.required);

		if (label)
			label = '<div class="{0}-label">{1}{2}:</div>'.format(cls, icon ? '<i class="{0}"></i>'.format(icon) : '', label);

		self.html(label + '<div class="' + cls + '-container"></div>');
		container = self.find(cls2 + '-container');

	};

	self.selectall = function() {

		if (config.disabled)
			return;

		var arr = [];
		var inputs = self.find(cls2 + '-item');
		var value = self.get();

		self.change(true);

		if (value && inputs.length === value.length) {
			self.set(arr);
			return;
		}

		inputs.each(function() {
			var el = $(this);
			arr.push(self.parser(data[+el.attrd('index')].value));
		});

		self.set(arr);
	};

	self.bind = function(path, value) {

		if (!value)
			return;

		var kv = config.value || 'id';
		var kt = config.text || 'name';

		render = '';
		data = [];
		dataold = value;

		for (var i = 0, length = value.length; i < length; i++) {
			var isString = typeof(value[i]) === 'string';
			var item = { value: isString ? value[i] : value[i][kv], text: isString ? value[i] : value[i][kt], index: i };
			render += template(item, config);
			data.push(item);
		}

		if (render)
			container.html(render);
		else
			container.html(config.empty);

		path && setTimeout(function() {
			self.refresh();
		}, 200);
	};

	self.setter = function(value) {
		container.find(cls2 + '-item').each(function() {
			var el = $(this);
			var index = +el.attrd('index');
			var checked = false;
			if (!value || !value.length)
				checked = false;
			else if (data[index])
				checked = data[index];
			checked && (checked = value.indexOf(checked.value) !== -1);
			el.tclass(cls + '-checked', checked);
		});
	};

	self.state = function(type) {
		if (type) {
			var invalid = config.required ? self.isInvalid() : false;
			if (invalid !== self.$oldstate) {
				self.$oldstate = invalid;
				self.tclass(cls + '-invalid', invalid);
			}
		}
	};
});

COMPONENT('loading', function(self, config, cls) {

	var delay;
	var prev;

	self.readonly();
	self.singleton();
	self.nocompile();

	self.make = function() {
		self.aclass(cls + ' ' + cls + '-' + (config.style || 1));
		self.append('<div><div class="' + cls + '-text hellip"></div></div>');
	};

	self.show = function(text) {
		clearTimeout(delay);

		if (prev !== text) {
			prev = text;
			self.find('.' + cls + '-text').html(text || '');
		}

		self.rclass('hidden');
		return self;
	};

	self.hide = function(timeout) {
		clearTimeout(delay);
		delay = setTimeout(function() {
			self.aclass('hidden');
		}, timeout || 1);
		return self;
	};

});

COMPONENT('centered', 'closebutton:1;closeesc:1;scrollbar:1;visibleY:0', function(self, config, cls) {

	var cls2 = '.' + cls;
	var events = {};
	var container, scroller;

	events.bind = function() {
		if (!events.is) {
			events.is = true;
			$(W).on('keydown', events.keydown);
		}
	};

	events.keydown = function(e) {
		if (e.which === 27)
			self.set('');
	};

	events.unbind = function() {
		if (events.is) {
			events.is = false;
			$(W).off('keydown', events.keydown);
		}
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {
		var css = { width: WW, height: WH };
		self.css(css);
		$(scroller).css(css);
		$(container).css({ height: WH });
		self.scrollbar && self.scrollbar.resize();
	};

	self.readonly();

	self.make = function() {

		self.aclass(cls + '-container hidden invisible');
		self.event('click', '[data-name="close"],[name="close"]', function() {
			self.set('');
		});

		if (self.dom.children[0].nodeName === ('SCRI' + 'PT')) {
			var html = self.dom.children[0].innerHTML;
			self.makeforce = function() {
				self.html('<span class="fas fa-times {0}-button{2}" data-name="close"></span><div class="{0}-content"><div class="{0}-body">{1}</div></div>'.format(cls, html, config.closebutton ? '' : ' hidden'));
				if (html.COMPILABLE())
					COMPILE();
				self.makeforce = null;
			};
		} else {
			container = document.createElement('DIV');
			container.setAttribute('class', cls + '-content');
			var div = document.createElement('DIV');
			div.setAttribute('class', cls + '-body');
			for (var i = 0; i < self.dom.children.length; i++)
				div.appendChild(self.dom.children[i]);

			container.appendChild(div);

			scroller = document.createElement('DIV');
			scroller.appendChild(container);

			if (config.scrollbar)
				self.scrollbar = SCROLLBAR($(scroller), { visibleY: config.visibleY });

			self.dom.appendChild(scroller);
			self.element.prepend('<span class="fas fa-times {0}-button{1}" data-name="close"></span>'.format(cls, config.closebutton ? '' : ' hidden'));
		}

		config.closeoutside && self.find(cls2 + '-body' + (typeof(config.closeoutside) === 'string' ? (',' + config.closeoutside) : '')).on('mousedown touchstart', function(e) {
			if (e.target === this)
				self.set('');
		});

		$(W).on('resize', self.resize);
	};

	self.destroy = function() {
		$(W).off('resize', self.resize);
	};

	self.setter = function(value) {
		var is = value === config.if;
		var hs = self.hclass('hidden');
		if (is === hs) {
			if (is) {
				self.makeforce && self.makeforce();
				config.closeesc && events.bind();
				config.default && DEFAULT(config.default, true);
				config.reload && EXEC(config.reload, self);
				config.zindex && self.css('z-index', config.zindex);
				if (!isMOBILE && config.autofocus) {
					setTimeout(function() {
						self.find(typeof(config.autofocus) === 'string' ? config.autofocus : 'input[type="text"],select,textarea').eq(0).focus();
					}, 1000);
				}

			} else
				config.closeesc && events.unbind();

			self.tclass('hidden', !is);
			self.resizeforce();
			self.rclass('invisible');
			$('html').tclass(cls + '-noscroll', is);
		}
	};
});

COMPONENT('enter', 'validate:1;trigger:button[name="submit"]', function(self, config) {
	self.readonly();
	self.make = function() {
		self.event('keydown', 'input', function(e) {
			if (e.which === 13 && (!config.validate || CAN(self.path))) {
				if (config.exec)
					EXEC(self.makepath(config.exec), self);
				else
					self.find(config.trigger).trigger('click');
			}
		});
	};
});

COMPONENT('spotlight', 'height:40;placeholder:Search', function(self, config, cls) {

	var cls2 = '.' + cls;
	var container, timeout, input, search, scroller = null;
	var is = false, selectedindex = 0, resultscount = 0, skip = false, checksum;

	self.items = null;
	self.template = Tangular.compile('<figure data-index="{{ $.index }}"{{ if selected }} class="selected"{{ fi }}>{{ if icon }}<i class="{{ icon }}"></i>{{ fi }}{{ if html }}{{ html | raw }}{{ else }}{{ name | raw }}{{ fi }}</figure>');
	self.callback = null;
	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	var onclick = function(e) {
		if (is && (!$(e.target).closest(cls2).length))
			self.hide();
	};

	self.select = function(index) {
		var item = self.items[index];
		if (item) {

			self.opt.callback && self.opt.callback(item);

			if (!self.opt.recent)
				return;

			var key = 'spotlight' + (self.opt.id || '');
			var arr = PREF[key] || [];
			var id = HASH(item) + '';
			item.spotlightid = id;

			if (arr.length && arr.findItem('spotlightid', id))
				return;

			arr.unshift(item);

			if (arr.length > 10)
				arr.pop();

			PREF.set(key, arr, typeof(self.opt.recent) === 'string' ? self.opt.recent : '1 month');
		}
	};

	self.make = function() {

		self.aclass(cls + '-layer hidden');
		self.append('<div class="{1}"><div class="{1}-search"><span><i class="fa fa-search"></i></span><div><input type="text" placeholder="{0}" class="{1}-search-input" /></div></div><div class="{1}-container"><div class="{1}-items"></div></div></div>'.format(config.placeholder, cls));

		container = self.find(cls2 + '-items');
		scroller = self.find(cls2 + '-container');
		input = self.find('input');
		search = self.find(cls2);

		self.event('click', 'figure[data-index]', function(e) {
			self.select(+this.getAttribute('data-index'));
			self.hide();
			e.preventDefault();
			e.stopPropagation();
		});

		$(W).on('resize', function() {
			is && self.hide(0);
		});

		self.event('keydown', 'input', function(e) {
			skip = false;
			switch (e.which) {
				case 27:
					skip = true;
					self.hide();
					self.opt.cancel && self.opt.cancel();
					break;
				case 13:
					skip = true;
					var sel = self.find('figure.selected');
					sel.length && self.select(+sel.attrd('index'));
					self.hide();
					break;
				case 38: // up
					skip = true;
					selectedindex--;
					if (selectedindex < 0)
						selectedindex = 0;
					else
						self.move();
					break;
				case 40: // down
					skip = true;
					selectedindex++ ;
					if (selectedindex >= resultscount)
						selectedindex = resultscount;
					else
						self.move();
					break;
			}

			if (skip) {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		self.event('keyup', 'input', function() {
			if (!skip)
				setTimeout2(self.id, self.search, self.opt.delay || 100, null, this.value);
		});
	};

	self.search = function(value) {
		if (typeof(self.opt.search) === 'function')
			self.opt.search(value, self.render);
		else {
			var url = self.opt.search.format(encodeURIComponent(value));
			if (self.opt.cache)
				AJAXCACHE(url, self.render, self.opt.cache);
			else
				AJAX(url, self.render);
		}
	};

	self.move = function() {
		var counter = 0;
		var h = scroller.css('max-height').parseInt();
		container.find('figure').each(function() {
			var el = $(this);
			if (el.hclass('hidden'))
				return;
			var is = selectedindex === counter;
			el.tclass('selected', is);
			if (is) {
				var t = (config.height * counter) - config.height;
				if ((t + config.height * 5) > h)
					scroller.scrollTop(t);
				else
					scroller.scrollTop(0);
			}
			counter++;
		});
	};

	self.render = function(items, noremap) {

		if (items) {

			if (!(items instanceof Array)) {
				self.render(items.items || items.response);
				return;
			}

			if (!noremap && self.opt.remap) {
				var tmp = self.opt.remap(items);
				if (tmp)
					items = tmp;
			}

			var newchecksum;

			if (self.items && items) {
				newchecksum = HASH(STRINGIFY(items, true));
				if (checksum === newchecksum)
					return;
			}

			checksum = newchecksum;
			self.items = items;
		}

		selectedindex = 0;
		resultscount = self.items.length;

		var builder = [];
		var indexer = {};

		for (var i = 0; i < self.items.length; i++) {
			var item = items[i];
			indexer.index = i;
			if (item.icon && item.icon.indexOf(' ') === -1)
				item.icon = 'fa fa-' + item.icon;
			builder.push(self.template(item, indexer));
		}

		container.html(builder);
		self.move();
	};

	self.show = function(opt) {

		if (is) {
			clearTimeout(timeout);
			self.hide(0);
			return;
		}

		var key = 'spotlight' + (opt.id || '');
		var recent = PREF[key];

		$(document).on('touchstart mousedown', onclick);
		self.opt = opt;
		self.rclass('hidden');

		if (opt.recent == null)
			opt.recent = '3 days';

		if (opt.clear)
			input.val('');

		if (!self.items || !self.items.length) {
			selectedindex = 0;
			if (recent && recent.length)
				self.render(recent, true);
			else {
				self.render([]);
				opt.init && self.search('');
			}
		}

		var w = ((WW / (isMOBILE ? 1.1 : 1.3)) >> 0);
		search.css({ width: w, left: ((WW - w) / 2) });
		scroller.css({ width: w + 50, 'max-height': (WH / 1.3) >> 0 });

		setTimeout(function() {
			self.aclass(cls + '-visible');
		}, 100);

		setTimeout(function() {
			input.focus();
		}, 500);

		is = true;
		$('html,body').aclass(cls + '-noscroll');
	};

	self.hide = function(sleep) {
		if (is) {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				$(document).off('touchstart mousedown', onclick);
				self.aclass('hidden').rclass(cls + '-visible');
				is = false;
				$('html,body').rclass(cls + '-noscroll');
			}, sleep ? sleep : 100);
		}
	};
});

COMPONENT('movable', function(self, config) {

	var events = {};
	var draggable;

	self.readonly();

	self.make = function() {
		var target = config.global ? $(document) : config.parent ? self.parent(config.parent) : self.element;
		target.on('dragenter dragover dragexit drop dragleave dragstart', config.selector, events.ondrag).on('mousedown', config.selector, events.ondown);
	};

	events.ondrag = function(e) {

		if (!draggable || config.disabled)
			return;

		if (e.type !== 'dragstart') {
			e.stopPropagation();
			e.preventDefault();
		}

		switch (e.type) {
			case 'drop':

				var parent = draggable.parentNode;
				var a = draggable;
				var b = e.target;
				var ai = -1;
				var bi = -1;
				var is = false;

				while (true) {
					if (b.parentNode === parent) {
						is = true;
						break;
					}
					b = b.parentNode;
					if (b == null || b.tagName === 'HTML')
						break;
				}

				if (a === b || !is)
					return;

				for (var i = 0; i < parent.children.length; i++) {
					var child = parent.children[i];
					if (a === child)
						ai = i;
					else if (b === child)
						bi = i;
					if (bi !== -1 && ai !== -1)
						break;
				}

				if (ai > bi)
					parent.insertBefore(a, b);
				else
					parent.insertBefore(a, b.nextSibling);

				config.exec && EXEC(self.makepath(config.exec), $(parent).find(config.selector), a, b);
				self.path && self.change(true);
				break;

			case 'dragstart':
				var eo = e.originalEvent;
				eo.dataTransfer && eo.dataTransfer.setData('text', '1');
				break;
			case 'dragenter':
			case 'dragover':
			case 'dragexit':
			case 'dragleave':
				break;
		}
	};

	events.ondown = function() {
		draggable = this;
	};

	self.destroy = function() {
		$(document).off('dragenter dragover dragexit drop dragleave dragstart', config.selector, events.ondrag).off('mousedown', config.selector, events.ondown);
	};
});

COMPONENT('textboxlist', 'maxlength:100;required:false;error:You reach the maximum limit;movable:false', function (self, config, cls) {

	var container, content;
	var empty = {};
	var skip = false;
	var cempty = cls + '-empty';
	var crequired = 'required';
	var helper = null;
	var cls2 = '.' + cls;

	self.setter = null;
	self.getter = null;
	self.nocompile && self.nocompile();

	self.template = Tangular.compile(('<div class="{0}-item"><div>'  + (config.movable ? '<i class="fa fa-angle-up {0}-up"></i><i class="fa fa-angle-down {0}-down"></i>' : '') + '<i class="fa fa-times {0}-remove"></i></div><div><input type="text" maxlength="{{ max }}" placeholder="{{ placeholder }}"{{ if disabled}} disabled="disabled"{{ fi }} value="{{ value }}" /></div></div>').format(cls));

	self.configure = function (key, value, init, prev) {

		if (init)
			return;

		var redraw = false;
		switch (key) {
			case 'disabled':
				self.tclass(crequired, value);
				self.find('input').prop('disabled', true);
				empty.disabled = value;
				self.reset();
				break;
			case 'maxlength':
				empty.max = value;
				self.find('input').prop(key, value);
				break;
			case 'placeholder':
				empty.placeholder = value;
				self.find('input').prop(key, value);
				break;
			case 'label':
				redraw = true;
				break;
			case 'icon':
				if (value && prev)
					self.find('i').rclass().aclass(value);
				else
					redraw = true;
				break;
		}

		if (redraw) {
			skip = false;
			self.redraw();
			self.refresh();
		}
	};

	self.redraw = function () {

		var icon = '';
		var html = config.label || content;

		if (config.icon)
			icon = '<i class="{0}"></i>'.format(config.icon.indexOf(' ') === -1 ? ('fa fa-' + config.icon) : config.icon);

		empty.value = '';
		self.tclass(cls + '-movable', !!config.movable);
		self.html((html ? ('<div class="' + cls + '-label{2}">{1}{0}:</div>').format(html, icon, config.required ? (' ' + cls + '-required') : '') : '') + ('<div class="' + cls + '-items"></div>' + self.template(empty).replace('-item"', '-item ' + cls + '-base"')));
		container = self.find(cls2 + '-items');
	};

	self.make = function () {

		empty.max = config.max;
		empty.placeholder = config.placeholder;
		empty.value = '';
		empty.disabled = config.disabled;

		if (config.disabled)
			self.aclass('ui-disabled');

		content = self.html();
		self.aclass(cls);
		self.redraw();

		self.move = function(offset, el) {

			var arr = self.get();
			var index = el.index();
			var tmp;

			if (offset === 1) {
				if (arr[index] == null || arr[index + 1] == null)
					return;
			} else {
				if (arr[index] == null || arr[index - 1] == null)
					return;
			}

			tmp = arr[index];
			arr[index] = arr[index + offset];
			arr[index + offset] = tmp;
			var items = self.find(cls2 + '-item');
			items.eq(index).find('input').val(arr[index]);
			items.eq(index + offset).find('input').val(arr[index + offset]);
			self.change(true);
		};

		self.event('click', cls2 + '-up', function () {
			self.move(-1, $(this).closest(cls2 + '-item'));
		});

		self.event('click', cls2 + '-down', function () {
			self.move(1, $(this).closest(cls2 + '-item'));
		});

		self.event('click', cls2 + '-remove', function () {

			if (config.disabled)
				return;

			var el = $(this);
			var parent = el.closest(cls2 + '-item');
			var value = parent.find('input').val();
			var arr = self.get();

			helper != null && helper.remove();
			helper = null;

			parent.remove();

			var index = arr.indexOf(value);
			if (index === -1)
				return;

			arr.splice(index, 1);

			self.tclass(cempty, !arr.length);
			self.tclass(crequired, config.required && !arr.length);

			skip = true;
			SET(self.path, arr, 2);
			self.change(true);
		});

		self.event('change keypress blur', 'input', function (e) {

			if ((e.type === 'keypress' && e.which !== 13) || config.disabled)
				return;

			var el = $(this);

			var value = this.value.trim();
			if (!value)
				return;

			var arr = [];
			var base = el.closest(cls2 + '-base');
			var len = base.length > 0;

			if (len && e.type === 'change')
				return;

			var raw = self.get();

			if (config.limit && len && raw.length >= config.limit) {
				if (!helper) {
					base.after(('<div class="' + cls + '-helper"><i class="fa fa-warning" aria-hidden="true"></i> {0}</div>').format(config.error));
					helper = container.closest(cls2).find(cls2 + '-helper');
				}
				return;
			}

			if (len) {

				if (!raw || raw.indexOf(value) === -1)
					self.push(value);

				this.value = '';
				self.change(true);
				return;
			}

			skip = true;

			container.find('input').each(function () {
				var temp = this.value.trim();
				switch (config.type) {
					case 'number':
						temp = temp.parseInt();
						break;
					case 'date':
						temp = temp.parseDate();
						break;
				}

				if (arr.indexOf(temp) === -1)
					arr.push(temp);
				else
					skip = false;
			});

			self.set(arr, 2);
			self.change(true);
		});
	};

	self.setter = function (value) {

		if (skip) {
			skip = false;
			return;
		}

		if (!value || !value.length) {
			self.aclass(cempty);
			config.required && self.aclass(crequired);
			container.empty();
			return;
		}

		self.rclass(cempty);
		self.rclass(crequired);
		var builder = [];

		for (var i = 0; i < value.length; i++) {
			empty.value = value[i];
			builder.push(self.template(empty));
		}

		container.empty().append(builder.join(''));
	};

	self.validate = function(value, init) {

		if (init)
			return true;

		var valid = !config.required;
		var items = container.children();

		if (!value || !value.length)
			return valid;

		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			!item && (item = '');
			switch (config.type) {
				case 'email':
					valid = item.isEmail();
					break;
				case 'url':
					valid = item.isURL();
					break;
				case 'currency':
				case 'number':
					valid = item > 0;
					break;
				case 'date':
					valid = item instanceof Date && !isNaN(item.getTime());
					break;
				default:
					valid = item.length > 0;
					break;
			}
			items.eq(i).tclass(cls + '-item-invalid', !valid);
		}

		return valid;
	};

});

COMPONENT('approve', 'cancel:Cancel', function(self, config, cls) {

	var cls2 = '.' + cls;
	var events = {};
	var buttons;
	var oldcancel;

	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		self.aclass(cls + ' hidden');
		self.html('<div><div class="{0}-body"><span class="{0}-close"><i class="fa fa-times"></i></span><div class="{0}-content"></div><div class="{0}-buttons"><button data-index="0"></button><button data-index="1"></button></div></div></div>'.format(cls));

		buttons = self.find(cls2 + '-buttons').find('button');

		self.event('click', 'button', function() {
			self.hide(+$(this).attrd('index'));
		});

		self.event('click', cls2 + '-close', function() {
			self.callback = null;
			self.hide(-1);
		});

		self.event('click', function(e) {
			var t = e.target.tagName;
			if (t !== 'DIV')
				return;
			var el = self.find(cls2 + '-body');
			el.aclass(cls + '-click');
			setTimeout(function() {
				el.rclass(cls + '-click');
			}, 300);
		});
	};

	events.keydown = function(e) {
		var index = e.which === 13 ? 0 : e.which === 27 ? 1 : null;
		if (index != null) {
			self.find('button[data-index="{0}"]'.format(index)).trigger('click');
			e.preventDefault();
			e.stopPropagation();
			events.unbind();
		}
	};

	events.bind = function() {
		$(W).on('keydown', events.keydown);
	};

	events.unbind = function() {
		$(W).off('keydown', events.keydown);
	};

	self.show = function(message, a, b, fn) {

		if (typeof(b) === 'function') {
			fn = b;
			b = config.cancel;
		}

		if (M.scope)
			self.currscope = M.scope();

		self.callback = fn;

		var icon = a.match(/"[a-z0-9-\s]+"/);
		if (icon) {

			var tmp = icon + '';
			if (tmp.indexOf(' ') == -1)
				tmp = 'fa fa-' + tmp;

			a = a.replace(icon, '').trim();
			icon = '<i class="{0}"></i>'.format(tmp.replace(/"/g, ''));
		} else
			icon = '';

		var color = a.match(/#[0-9a-f]+/i);
		if (color)
			a = a.replace(color, '').trim();

		buttons.eq(0).css('background-color', color || '').html(icon + a);

		if (oldcancel !== b) {
			oldcancel = b;
			buttons.eq(1).html(b);
		}

		self.find(cls2 + '-content').html(message.replace(/\n/g, '<br />'));
		$('html').aclass(cls + '-noscroll');
		self.rclass('hidden');
		events.bind();
		self.aclass(cls + '-visible', 5);
	};

	self.hide = function(index) {

		if (!index) {
			self.currscope && M.scope(self.currscope);
			self.callback && self.callback(index);
		}

		self.rclass(cls + '-visible');
		events.unbind();
		setTimeout2(self.id, function() {
			$('html').rclass(cls + '-noscroll');
			self.aclass('hidden');
		}, 1000);
	};
});

COMPONENT('radiobutton', 'inline:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var template = '<div data-value="{1}"><i></i><span>{0}</span></div>';

	self.nocompile();

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				break;
			case 'type':
				self.type = config.type;
				break;
			case 'label':
				self.find(cls2 + '-label').html(value);
				break;
			case 'items':
				self.find('div[data-value]').remove();
				var builder = [];
				value.split(',').forEach(function(item) {
					item = item.split('|');
					builder.push(template.format(item[0] || item[1], item[1] || item[0]));
				});
				self.append(builder.join(''));
				self.refresh();
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
		}
	};

	self.make = function() {
		var builder = [];
		var label = config.label || self.html();
		label && builder.push('<div class="' + cls + '-label{1}">{0}</div>'.format(label, config.required ? (' ' + cls + '-label-required') : ''));
		self.aclass(cls + (!config.inline ? (' ' + cls + '-block') : '') + (config.disabled ? ' ui-disabled' : ''));
		self.event('click', 'div[data-value]', function() {
			if (config.disabled)
				return;
			var value = self.parser($(this).attrd('value'));
			self.set(value);
			self.change(true);
		});
		self.html(builder.join(''));
		config.items && self.reconfigure('items:' + config.items);
		config.datasource && self.reconfigure('datasource:' + config.datasource);
		config.type && (self.type = config.type);
	};

	self.validate = function(value) {
		return config.disabled || !config.required ? true : !!value;
	};

	self.setter = function(value) {
		self.find('div[data-value]').each(function() {
			var el = $(this);
			var is = el.attrd('value') === (value == null ? null : value.toString());
			el.tclass(cls + '-selected', is);
			el.find('.fa').tclass('fa-circle-o', !is).tclass('fa-circle', is);
		});
	};

	self.bind = function(path, arr) {

		if (!arr)
			arr = EMPTYARRAY;

		var builder = [];
		var propText = config.text || 'name';
		var propValue = config.value || 'id';

		var type = typeof(arr[0]);
		var notObj = type === 'string' || type === 'number';

		for (var i = 0, length = arr.length; i < length; i++) {
			var item = arr[i];
			if (notObj)
				builder.push(template.format(item, item));
			else
				builder.push(template.format(item[propText], item[propValue]));
		}

		self.find('div[data-value]').remove();
		self.append(builder.join(''));
		self.refresh();
	};
});

COMPONENT('clipboard', function(self) {

	var container;

	self.singleton();
	self.readonly();
	self.nocompile && self.nocompile();

	self.copy = function(value) {
		container.val(value);
		container.focus();
		container.select();
		document.execCommand('copy');
		container.blur();
	};

	self.make = function() {
		var id = 'clipboard' + self.id;
		$(document.body).append('<textarea id="{0}" class="ui-clipboard"></textarea>'.format(id));
		container = $('#' + id);
	};

	self.setter = function(value) {
		value && self.copy(value);
	};
});

COMPONENT('shortcuts', function(self) {

	var items = [];
	var length = 0;
	var keys = {};
	var keys_session = {};
	var issession = false;

	self.singleton();
	self.readonly();
	self.blind();
	self.nocompile && self.nocompile();

	var cb = function(o, e) {
		o.callback(e, o.owner);
	};

	self.make = function() {

		$(W).on('keydown', function(e) {

			var f = e.key;
			var c = e.keyCode;

			if (f.length > 1 && f.charAt(0) === 'F')
				c = 0;
			else
				f = '-';

			// ctrl,alt,shift,meta,fkey,code
			var key = (e.ctrlKey ? 1 : 0) + '' + (e.altKey ? 1 : 0) + '' + (e.shiftKey ? 1 : 0) + '' + (e.metaKey ? 1 : 0) + f + c;

			if (issession) {
				if (!keys_session[key])
					return;
			} else {
				if (!keys[key])
					return;
			}

			if (length && !e.isPropagationStopped()) {
				for (var i = 0; i < length; i++) {
					var o = items[i];
					if (o.fn(e)) {
						if (o.prevent) {
							e.preventDefault();
							e.stopPropagation();
						}
						setTimeout(cb, 100, o, e);
						return;
					}
				}
			}
		});

		ON('component + knockknock', self.refresh);
	};

	self.refreshforce = function() {

		var arr = document.querySelectorAll('.shortcut');
		var index = 0;

		while (true) {
			var item = items[index++];
			if (item == null)
				break;
			if (item.owner) {
				index--;
				items.splice(index, 1);
			}
		}

		for (var i = 0; i < arr.length; i++) {
			var shortcut = arr[i].getAttribute('data-shortcut');
			shortcut && self.register(shortcut, self.execshortcut, true, arr[i]);
		}
	};

	self.session = function(callback) {
		issession = true;
		keys_session = {};
		callback(self.register);
	};

	self.end = function() {
		issession = false;
	};

	self.execshortcut = function(e, owner) {
		$(owner).trigger('click');
	};

	self.refresh = function() {
		setTimeout2(self.ID, self.refreshforce, 500);
	};

	self.exec = function(shortcut) {
		var item = items.findItem('shortcut', shortcut.toLowerCase().replace(/\s/g, ''));
		item && item.callback(EMPTYOBJECT, item.owner);
	};

	self.register = function(shortcut, callback, prevent, owner) {

		var currentkeys = issession ? keys_session : keys;

		shortcut.split(',').trim().forEach(function(shortcut) {

			var builder = [];
			var alias = [];
			var cachekey = [0, 0, 0, 0, '-', 0]; // ctrl,alt,shift,meta,fkey,code

			shortcut.split('+').trim().forEach(function(item) {
				var lower = item.toLowerCase();
				alias.push(lower);

				switch (lower) {
					case 'ctrl':
						cachekey[0] = 1;
						break;
					case 'alt':
						cachekey[1] = 1;
						break;
					case 'shift':
						cachekey[2] = 1;
						break;
					case 'win':
					case 'meta':
					case 'cmd':
						cachekey[3] = 1;
						break;
				}

				switch (lower) {
					case 'ctrl':
					case 'alt':
					case 'shift':
						builder.push('e.{0}Key'.format(lower));
						return;
					case 'win':
					case 'meta':
					case 'cmd':
						builder.push('e.metaKey');
						return;
					case 'ins':
						builder.push('e.keyCode===45');
						cachekey[5] = 45;
						return;
					case 'space':
						builder.push('e.keyCode===32');
						cachekey[5] = 32;
						return;
					case 'tab':
						builder.push('e.keyCode===9');
						cachekey[5] = 9;
						return;
					case 'esc':
						builder.push('e.keyCode===27');
						cachekey[5] = 27;
						return;
					case 'enter':
						builder.push('e.keyCode===13');
						cachekey[5] = 13;
						return;
					case 'backspace':
						builder.push('e.keyCode===8');
						cachekey[5] = 8;
						break;
					case 'del':
					case 'delete':
						builder.push('e.keyCode===46');
						cachekey[5] = 46;
						return;
					case 'save':
						builder.push('(e.metaKey&&e.keyCode===115)');
						cachekey[5] = -1;
						return;
					case 'remove':
						builder.push('((e.metaKey&&e.keyCode===8)||e.keyCode===46)');
						cachekey[5] = -1;
						return;
					case 'up':
						builder.push('e.keyCode===38');
						cachekey[5] = 38;
						return;
					case 'down':
						builder.push('e.keyCode===40');
						cachekey[5] = 40;
						return;
					case 'right':
						builder.push('e.keyCode===39');
						cachekey[5] = 39;
						return;
					case 'left':
						builder.push('e.keyCode===37');
						cachekey[5] = 37;
						return;
					case 'f1':
					case 'f2':
					case 'f3':
					case 'f4':
					case 'f5':
					case 'f6':
					case 'f7':
					case 'f8':
					case 'f9':
					case 'f10':
					case 'f11':
					case 'f12':
						var a = item.toUpperCase();
						builder.push('e.key===\'{0}\''.format(a));
						cachekey[4] = a;
						return;
					case 'capslock':
						builder.push('e.which===20');
						cachekey[5] = 20;
						return;
				}

				var num = item.parseInt();
				if (num) {
					builder.push('e.which===' + num);
					cachekey[5] = num;
				} else {
					num = item.toUpperCase().charCodeAt(0);
					cachekey[5] = num;
					builder.push('e.keyCode==={0}'.format(num));
				}
			});

			items.push({ shortcut: alias.join('+'), fn: new Function('e', 'return ' + builder.join('&&')), callback: callback, prevent: prevent, owner: owner });
			length = items.length;

			var k;

			// Remove
			if (cachekey[5] === -1) {
				cachekey[5] = 8;
				k = cachekey.join('');
				currentkeys[k] = 1;
				cachekey[5] = 46;
			}

			k = cachekey.join('');
			currentkeys[k] = 1;
		});

		if (!owner)
			self.refresh();

		return self;
	};
});

COMPONENT('dropdowncheckbox', 'checkicon:check;visible:0;alltext:All selected;limit:0;selectedtext:{0} selected', function(self, config, cls) {

	var cls2 = '.' + cls;
	var data = [], render = '';
	var container, values, content, datasource = null;
	var prepared = false;
	var W = window;

	!W.$dropdowncheckboxtemplate && (W.$dropdowncheckboxtemplate = Tangular.compile('<div class="' + cls + '-item" data-index="{{ index }}"><div><i class="fa fa-{{ $.checkicon }}"></i></div><span>{{ text }}</span></div>'));
	var template = W.$dropdowncheckboxtemplate;

	self.nocompile && self.nocompile();

	self.validate = function(value) {
		return config.disabled || !config.required ? true : value && value.length > 0;
	};

	self.configure = function(key, value, init) {

		if (init)
			return;

		var redraw = false;

		switch (key) {

			case 'type':
				self.type = value;
				break;

			case 'required':
				self.tclass(cls + '-required', config.required);
				break;

			case 'label':
				content = value;
				redraw = true;
				break;

			case 'disabled':
				self.tclass('ui-disabled', value);
				self.reset();
				break;

			case 'checkicon':
				self.find('i').rclass().aclass(value.indexOf(' ') === -1 ? ('fa fa-' + value) : value);
				break;

			case 'icon':
				redraw = true;
				break;

			case 'datasource':
				self.datasource(value, self.bind);
				datasource && self.refresh();
				datasource = value;
				break;

			case 'items':

				if (value instanceof Array) {
					self.bind('', value);
					return;
				}

				var items = [];
				value.split(',').forEach(function(item) {
					item = item.trim().split('|');
					var val = (item[1] == null ? item[0] : item[1]).trim();
					if (config.type === 'number')
						val = +val;
					items.push({ name: item[0].trim(), id: val });
				});

				self.bind('', items);
				self.refresh();
				break;
		}

		redraw && setTimeout2(self.id + '.redraw', self.redraw, 100);
	};

	self.redraw = function() {

		var html = '<div class="{0}"><i class="fa fa-angle-down"></i><div class="{0}-selected"></div></div><div class="{0}-values hidden">{1}</div>'.format(cls, render);
		if (content.length)
			self.html('<div class="{0}-label">{1}{2}:</div>'.format(cls, config.icon ? ('<i class="' + (config.icon.indexOf(' ') === -1 ? ('fa fa-' + config.icon) : config.icon) + '"></i>') : '', content) + html);
		else
			self.html(html);

		container = self.find(cls2 + '-values');
		values = self.find(cls2 + '-selected');
		prepared && self.refresh();
		self.tclass('ui-disabled', config.disabled === true);
		self.tclass(cls + '-required', config.required === true);
	};

	self.make = function() {

		self.type = config.type;

		content = self.html();
		self.aclass(cls + '-container');
		self.redraw();

		if (config.items)
			self.reconfigure({ items: config.items });
		else if (config.datasource)
			self.reconfigure({ datasource: config.datasource });
		else
			self.bind('', null);

		self.event('click', cls2, function(e) {

			if (config.disabled)
				return;

			container.tclass('hidden');

			if (W.$dropdowncheckboxelement) {
				W.$dropdowncheckboxelement.aclass('hidden');
				W.$dropdowncheckboxelement = null;
			}

			!container.hclass('hidden') && (W.$dropdowncheckboxelement = container);
			e.stopPropagation();
		});

		self.event('click', cls2 + '-item', function(e) {

			e.stopPropagation();

			if (config.disabled)
				return;

			var el = $(this);
			var is = !el.hclass(cls + '-checked');
			var index = +el.attrd('index');
			var value = data[index];

			if (value === undefined)
				return;

			value = value.value;

			var arr = self.get();

			if (!(arr instanceof Array))
				arr = [];

			var index = arr.indexOf(value);

			if (is) {
				if (config.limit && arr.length === config.limit)
					return;
				index === -1 && arr.push(value);
			} else {
				index !== -1 && arr.splice(index, 1);
			}

			self.set(arr);
			self.change(true);
		});
	};

	self.bind = function(path, value) {
		var clsempty = cls + '-values-empty';

		if (value !== undefined)
			prepared = true;

		if (!value || !value.length) {
			var h = config.empty || '&nbsp;';
			if (h === self.old)
				return;
			container.aclass(clsempty).html(h);
			self.old = h;
			return;
		}

		var kv = config.value || 'id';
		var kt = config.text || 'name';

		render = '';
		data = [];

		for (var i = 0, length = value.length; i < length; i++) {
			var isString = typeof(value[i]) === 'string';
			var item = { value: isString ? value[i] : value[i][kv], text: isString ? value[i] : value[i][kt], index: i };
			render += template(item, config);
			data.push(item);
		}

		var h = HASH(render);
		if (h === self.old)
			return;

		self.old = h;

		if (render)
			container.rclass(clsempty).html(render);
		else
			container.aclass(clsempty).html(config.empty);

		self.refresh();
	};

	self.setter = function(value) {

		if (!prepared)
			return;

		var label = '';
		var count = value == null || !value.length ? undefined : value.length;

		if (value && count) {
			var remove = [];
			for (var i = 0; i < count; i++) {
				var selected = value[i];
				var index = 0;
				var is = false;
				while (true) {
					var item = data[index++];
					if (item === undefined)
						break;
					if (item.value != selected)
						continue;
					label += (label ? ', ' : '') + item.text;
					is = true;
				}
				!is && remove.push(selected);
			}

			if (config.cleaner !== false && value) {
				var refresh = false;
				while (true) {
					var item = remove.shift();
					if (item === undefined)
						break;
					value.splice(value.indexOf(item), 1);
					refresh = true;
				}
				refresh && self.set(value);
			}
		}

		container.find(cls2 + '-item').each(function() {
			var el = $(this);
			var index = +el.attrd('index');
			var checked = false;
			if (!value || !value.length)
				checked = false;
			else if (data[index])
				checked = data[index];
			checked && (checked = value.indexOf(checked.value) !== -1);
			el.tclass(cls + '-checked', checked);
		});

		if (!label && value && config.cleaner !== false) {
			// invalid data
			// it updates model without notification
			self.rewrite([]);
		}

		if (!label && config.placeholder) {
			values.rattr('title', '');
			values.html('<span class="{1}-placeholder">{0}</span>'.format(config.placeholder, cls));
		} else {
			if (count == data.length && config.alltext !== 'null' && config.alltext)
				label = config.alltext;
			else if (config.visible && count > config.visible)
				label = config.selectedtext.format(count, data.length);
			values.attr('title', label);
			values.html(label);
		}
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass(cls + '-invalid', invalid);
	};

	if (!W.$dropdowncheckboxevent) {
		W.$dropdowncheckboxevent = true;
		$(document).on('click', function() {
			if (W.$dropdowncheckboxelement) {
				W.$dropdowncheckboxelement.aclass('hidden');
				W.$dropdowncheckboxelement = null;
			}
		});
	}
});