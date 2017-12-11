"use strict";

var _domCount = 2;
var _keyValueDom = '<div class="key-value-pair-control"><div class="row"> \
    <div class="form-group col-md-6"> \
      <label>Key</label> \
      <input class="form-control key" placeholder="Key"> \
    </div> \
    <div class="form-group col-md-6"> \
      <label>Value</label> \
      <input class="form-control value" placeholder="Value"> \
    </div> \
  </div> \
  <div class="row col-md-12"> \
    <a href="javascript:void(0);" class="btn btn-info btn-xs add-children"> \
      <span class="glyphicon glyphicon-plus"></span>&nbsp;Add Child \
    </a> \
    <a href="javascript:void(0);" class="btn btn-danger btn-xs remove-form"> \
      <span class="glyphicon glyphicon-minus"></span>&nbsp;Remove \
    </a> \
  </div></div>';

function genNode(pid, marginLeft, key, value) {
    if (!pid) {
        pid = 0;
    }
    var dom = $(_keyValueDom);
    dom.find('.key').val(key);
    dom.find('.value').val(value);
    dom.data('id', _domCount);
    dom.data('pid', pid);

    if (Number(pid) > 0) {
        dom.css('margin-left', marginLeft);
    }

    _domCount++;
    return dom;
}

function sonsTree(arr, id) {
    var temp = [], lev = 0;
    var forFn = function (arr, id, lev) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item.pid === id) {
                item.lev = lev;
                temp.push(item);
                forFn(arr, item.id, lev + 1);
            }
        }
    };
    forFn(arr, id, lev);
    return temp;
}

function remNode(id) {
    var keyValuePairArr = [];
    $('.key-value-pair-control').each(function (index, el) {
        var elDom = $(el);
        var key = elDom.find('.key').val();
        var value = elDom.find('.value').val();
        var pair = {};
        pair[key] = value;
        keyValuePairArr.push({
            'pid': elDom.data('pid'),
            'id': elDom.data('id'),
            'dom': elDom
        });
    });

    var tree = sonsTree(keyValuePairArr, id);
    $(tree).each(function (index, el) {
        el.dom.remove();
        _domCount--;
    });
}

function listToTree(list) {
    var map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i;
        list[i].children = [];
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (Number(node.pid) !== 0) {
            list[map[node.pid]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

function treeToJson(root, parent) {
    if (root.children.length === 0) {
        parent[root.kv.key] = root.kv.value;
    } else {
        parent[root.kv.key] = {};
        for (var child in root.children) {
            if (root.children.hasOwnProperty(child)) {
                treeToJson(root.children[child], parent[root.kv.key]);
            }
        }
    }
}

function jsonToDom(json, dom, pid, marginLeft) {
    Object.keys(json).forEach(function (key) {
        var value = '';
        if (typeof json[key] === 'string' || json[key] instanceof String) {
            value = json[key];
        }

        var newDom = genNode(pid, marginLeft, key, value);
        if(_domCount === 3) {
            var firstDom = $('div[data-id="1"]');
            firstDom.find('.key').val(key);
            firstDom.find('.value').val(value);
        } else {
            dom.push(newDom);
        }

        if (typeof json[key] === 'object' || json[key] instanceof Object) {
            jsonToDom(json[key], dom, _domCount - 1, marginLeft + 15);
        }
    });
}

jQuery(document).ready(function ($) {
    $('.append-form').on('click', function () {
        $('.main-container').append(genNode());
    });

    $(document).on('click', '.add-children', function () {
        var parent = $(this).parent('div').parent('div');
        var pid = parent.data('id');
        var marginLeft = parseInt(parent.css('margin-left'));
        var newMarginLeft = marginLeft + 15;
        newMarginLeft = newMarginLeft + 'px';
        parent.after(genNode(pid, newMarginLeft));
    });

    $(document).on('click', '.remove-form', function () {
        _domCount--;
        var parent = $(this).parent('div').parent('div');
        remNode(parent.data('id'));
        parent.remove();
    });

    $(document).on('click', '.submit', function () {
        var keyValuePairArr = [];
        $('.key-value-pair-control').each(function (index, el) {
            var elDom = $(el);
            var key = elDom.find('.key').val();
            var value = elDom.find('.value').val();
            var pair = {};
            pair['key'] = key;
            pair['value'] = value;
            keyValuePairArr.push({
                'pid': elDom.data('pid'),
                'id': elDom.data('id'),
                'kv': pair
            });
        });

        var list = sonsTree(keyValuePairArr, 0);
        var tree = listToTree(list);
        var json = {};

        for (var child in tree) {
            if (tree.hasOwnProperty(child)) {
                treeToJson(tree[child], json);
            }
        }
        $('.result').val(JSON.stringify(json));
    });
    $('.edit').on('click', function () {
        var json = $('.result').val();
        if (json) {
            var originJson = jQuery.parseJSON(json);
            var dom = [];
            jsonToDom(originJson, dom, 0, 0);
            for (var d in dom) {
                $('.main-container').append(dom[d]);
            }
        }
    });
});