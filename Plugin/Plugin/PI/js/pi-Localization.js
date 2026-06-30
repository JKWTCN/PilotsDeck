function loadPiLocalization(info) {
	var language = normalizePiLanguage(info);
	var candidates = uniquePiLanguages([language, language.split("_")[0], "en"]);
	loadPiLocalizationCandidate(candidates, 0);
}

function normalizePiLanguage(info) {
	var application = info && info.application ? info.application : {};
	var language = application.language || application.locale || navigator.language || "en";
	return String(language).replace("-", "_");
}

function uniquePiLanguages(values) {
	var result = [];
	values.forEach(function (value) {
		if (value && result.indexOf(value) === -1)
			result.push(value);
	});
	return result;
}

function loadPiLocalizationCandidate(candidates, index) {
	if (index >= candidates.length)
		return;

	var request = new XMLHttpRequest();
	request.open("GET", "../../" + candidates[index] + ".json", true);
	request.onreadystatechange = function () {
		if (request.readyState !== 4)
			return;

		if (request.status === 200 || request.status === 0) {
			try {
				var data = JSON.parse(request.responseText);
				if (data && data.Localization) {
					applyPiLocalization(data.Localization);
					return;
				}
			}
			catch (error) {
				// Try the next fallback language.
			}
		}

		loadPiLocalizationCandidate(candidates, index + 1);
	};
	request.send();
}

function applyPiLocalization(localization) {
	translateTextNodes(document.body, localization);
	translateAttributes(document.body, localization, ["placeholder", "title"]);
}

function translateTextNodes(root, localization) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		}
	});

	var nodes = [];
	while (walker.nextNode())
		nodes.push(walker.currentNode);

	nodes.forEach(function (node) {
		var original = node.nodeValue;
		var leading = original.match(/^\s*/)[0];
		var trailing = original.match(/\s*$/)[0];
		var key = original.trim().replace(/\s+/g, " ");
		if (localization[key])
			node.nodeValue = leading + localization[key] + trailing;
	});
}

function translateAttributes(root, localization, attributes) {
	Array.prototype.forEach.call(root.querySelectorAll("*"), function (element) {
		attributes.forEach(function (attribute) {
			var value = element.getAttribute(attribute);
			if (value && localization[value])
				element.setAttribute(attribute, localization[value]);
		});
	});
}
