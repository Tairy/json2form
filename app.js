"use strict";

var _domCount = 2;
var _nodeCount = 1;
var _keyValueDom = '<div class="key-value-pair-control"><div class="row"> \
    <div class="form-group col-md-6"> \
      <label>Key</label> \
      <input type="text" class="form-control key" placeholder="Key"> \
    </div> \
    <div class="form-group col-md-6"> \
      <label>Value</label> \
      <input type="text" class="form-control value" placeholder="Value"> \
    </div> \
  </div> \
  <div class="row col-md-12"> \
    <a href="javascript:void(0);" class="btn btn-info btn-xs add-children"> \
      <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>&nbsp;Add Child \
    </a> \
    <a href="javascript:void(0);" class="btn btn-danger btn-xs remove-form"> \
      <span class="glyphicon glyphicon-minus" aria-hidden="true"></span>&nbsp;Remove \
    </a> \
  </div></div>';

function genNode(pid, marginLeft, key, value) {
    var dom = $(_keyValueDom);
    dom.find('.key').val('id:' + _domCount + 'pid:' + pid);
    dom.find('.value').val(value);
    dom.data('id', _domCount);
    dom.data('pid', pid);

    if (Number(pid) > 0) {
        var newMarginLeft = marginLeft + 15;
        newMarginLeft = newMarginLeft + 'px';
        dom.css('margin-left', newMarginLeft);
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
        var el = $(el);
        var key = el.find('.key').val();
        var value = el.find('.value').val();
        var pair = {};
        pair[key] = value;
        keyValuePairArr.push({
            'pid': el.data('pid'),
            'id': el.data('id'),
            'dom': el
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
        if (node.pid !== 0) {
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
            treeToJson(root.children[child], parent[root.kv.key]);
        }
    }
}

function jsonToList(json, list, pid) {
    Object.keys(json).forEach(function (key) {
        var pair = {};
        pair['key'] = key;
        if (typeof json[key] === 'string' || json[key] instanceof String) {
            pair['value'] = json[key];
        } else {
            pair['value'] = '';
        }
        list.push({
            'pid': pid,
            'id': _nodeCount,
            'kv': pair,
        });

        if (typeof json[key] === 'object' || json[key] instanceof Object) {
            jsonToList(json[key], list, _nodeCount);
        }
        _nodeCount++;
    });
}

jQuery(document).ready(function ($) {
    $('.append-form').on('click', function () {
        $('.main-container').append(genNode());
    });

    $(document).on('click', '.add-children', function () {
        var parent = $(this).parent('div').parent('div');
        var pid = parent.data('id');
        var pLevel = parent.data('level');
        var marginLeft = parseInt(parent.css('margin-left'));
        parent.after(genNode(pid, marginLeft));
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
            var el = $(el);
            var key = el.find('.key').val();
            var value = el.find('.value').val();
            var pair = {};
            pair['key'] = key;
            pair['value'] = value;
            keyValuePairArr.push({
                'pid': el.data('pid'),
                'id': el.data('id'),
                'kv': pair,
            });
        });

        var list = sonsTree(keyValuePairArr, 0);
        var tree = listToTree(list);
        var json = {};

        for (var child in tree) {
            treeToJson(tree[child], json);
        }
        $('.result').val(JSON.stringify(json));
    });
    $('.edit').on('click', function () {
        var json = $('.result').val();
        if (json) {
            var originJson = jQuery.parseJSON(json);
            var list = [];
            jsonToList(originJson, list, 0);
            var tree = listToTree(list);
            console.log(tree);
            // iterator1(originJson);
            // console.log(originJson);
        }
    });
});