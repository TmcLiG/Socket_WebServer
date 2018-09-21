var apiWeiboAll = function(callback) {
    var path = '/api/weibo/all'
    ajax('GET', path, '', callback)
}

var apiWeiboAdd = function(form, callback) {
    var path = '/api/weibo/add'
    ajax('POST', path, form, callback)
}

var apiCommentAdd = function(form, callback) {
    var path = '/api/weibo/comment/add'
    ajax('POST', path, form, callback)
}

var apiWeiboDelete = function(weibo_id, callback) {
    var path = `/api/weibo/delete?id=${weibo_id}`
    ajax('GET', path, '', callback)
}

var apiCommentDelete = function(comment_id, callback) {
    var path = `/api/comment/delete?id=${comment_id}`
    ajax('GET', path, '', callback)
}
var apiCommentUpdate = function(form, callback) {
    var path = '/api/comment/update'
    ajax('POST', path, form, callback)
}

var apiWeiboUpdate = function(form, callback) {
    var path = '/api/weibo/update'
    ajax('POST', path, form, callback)
}

var weiboTemplate = function(weibo) {
    var t = `
        <div class="weibo-cell" data-id="${weibo.id}">
            <span class="weibo-content">${weibo.content}</span>
            <span>创建时间：${weibo.created_time}</span>
            <span>更新时间：${weibo.updated_time}</span>
            <button class="weibo-delete">删除</button>
            <button class="weibo-edit">编辑</button>
            <div id='id-add-comment'>
                <input id='id-input-comment'>
                <button class='button-comment'>发表评论</button>
            </div>
        </div>
    `
    return t
}

var commentTemplate = function(comment){
    var c = `
        <div class='comment-cell' data-id='${comment.id}'>
            <span>评论的用户名： ${comment.username}</span>
            <span>评论：<span class='class-comment-content'> ${comment.content}</span></span>
            <button class='delete-comment'>删除评论</button>
            <button class='edit-comment'>编辑评论</button>
        </div>
    `
    return c
}
var insertComment = function(comment) {
    var comment_template = commentTemplate(comment)
    var weiboCells = document.querySelectorAll('.weibo-cell')
    for (var i = 0; i < weiboCells.length; i++) {
        var weiboCell = weiboCells[i]
        if (Number(weiboCell.dataset['id']) == comment.weibo_id) {
             var commentCell = e('#id-add-comment', weiboCell)
            commentCell.insertAdjacentHTML('beforeBegin', comment_template)
        }
    }
}


var weiboUpdateTemplate = function(content) {
    var t = `
        <div class="weibo-update-form">
            <input class="weibo-update-input" value="${content}">
            <button class="weibo-update">更新</button>
        </div>
    `
    return t
}
var commentUpdateTemplate = function(content) {
    var t = `
        <div class="comment-update-form">
            <input class="comment-update-input" value="${content}">
            <button class="comment-update">更新</button>
        </div>
    `
    return t
}

var insertWeibo = function(weibo) {
    var weiboCell = weiboTemplate(weibo)
    var weiboList = e('#id-weibo-list')
    weiboList.insertAdjacentHTML('beforeend', weiboCell)
}

var insertUpdateForm = function(content, weiboCell) {
    var updateForm = weiboUpdateTemplate(content)
    weiboCell.insertAdjacentHTML('beforeend', updateForm)
}
var insertCommentUpdateForm = function(content, commentCell) {
    var updateForm = commentUpdateTemplate(content)
    commentCell.insertAdjacentHTML('beforeend', updateForm)
}

var loadWeibos = function() {
    apiWeiboAll(function(ws) {
        log('load all ws是什么东西：', ws)
        for(var i = 0; i < ws.length; i++) {
            log('ws', ws[i])
            var weibo = ws[i]
            insertWeibo(weibo)
            for (var j = 0; j < weibo.comments.length; j++) {
                var comment = weibo.comments[j]
                insertComment(comment)
            }
        }
    })
}

var bindEventCommentAdd = function() {
    var b = e('#id-weibo-list')
    b.addEventListener('click', function(event){
        var self = event.target
        if (self.classList.contains('button-comment')) {
            var element = self.closest('.weibo-cell')
            var input = e('#id-input-comment', element)
            var date = Number(element.dataset['id'])
            var content = input.value
            log('click add', content)
            log('weibo_id', date)
            var form = {
                content: content,
                weibo_id: date,
            }
            apiCommentAdd(form, function(comment) {
                log('comment是什么:', comment)
                insertComment(comment)
                input.value = ''
            })
        }
    })
}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add')
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        log('click add', content)
        var form = {
            content: content,
        }
        apiWeiboAdd(form, function(weibo) {
            insertWeibo(weibo)
            input.value = ''
        })
    })
}


var bindEventWeiboDelete = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        var self = event.target
        log('被点击的元素', self)
        if (self.classList.contains('weibo-delete')) {
            log('点到了删除按钮')
            weiboId = self.parentElement.dataset['id']
            apiWeiboDelete(weiboId, function(r) {
                log('apiWeiboDelete', r.message)
                self.parentElement.remove()
                alert(r.message)
            })
        } else {
            log('点到了 weibo cell')
        }
    })
}




var bindEventCommentDelete = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
        var self = event.target
        log('被点击的元素', self)
        if (self.classList.contains('delete-comment')) {
            log('点到了删除按钮')
            commentId = self.parentElement.dataset['id']
            apiCommentDelete(commentId, function(r) {
                log('apiCommentDelete', r.message)
                self.parentElement.remove()
                alert(r.message)
            })
        } else {
            log('点到了 comment cell')
        }
    })
}







var bindEventWeiboEdit = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    log(event)
    var self = event.target
    log('被点击的元素', self)
    log(self.classList)
    if (self.classList.contains('weibo-edit')) {
        log('点到了编辑按钮')
        weiboCell = self.closest('.weibo-cell')
        weiboId = weiboCell.dataset['id']
        var weiboSpan = e('.weibo-content', weiboCell)
        var content = weiboSpan.innerText
        insertUpdateForm(content, weiboCell)
    } else {
        log('点到了 weibo cell')
    }
})}

var bindEventWeiboUpdate = function() {
    var weiboList = e('#id-weibo-list')
    weiboList.addEventListener('click', function(event) {
    log(event)
    var self = event.target
    log('被点击的元素', self)
    log(self.classList)
    if (self.classList.contains('weibo-update')) {
        log('点到了更新按钮')
        weiboCell = self.closest('.weibo-cell')
        weiboId = weiboCell.dataset['id']
        log('update weibo id', weiboId)
        input = e('.weibo-update-input', weiboCell)
        content = input.value
        var form = {
            id: weiboId,
            content: content,
        }

        apiWeiboUpdate(form, function(weibo) {
            log('apiWeiboUpdate', weibo)

            var weiboSpan = e('.weibo-content', weiboCell)
            weiboSpan.innerText = weibo.content

            var updateForm = e('.weibo-update-form', weiboCell)
            updateForm.remove()
        })
    } else {
        log('点到了 weibo cell')
    }
})}



var bindEventCommentEdit = function() {
    var commentList = e('#id-weibo-list')
    commentList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('edit-comment')) {
            log('点到了编辑按钮')
            commentCell = self.closest('.comment-cell')
            commentId = commentCell.dataset['id']
            var commentSpan = e('.class-comment-content',commentCell)
            var content = commentSpan.innerText
            insertCommentUpdateForm(content, commentCell)
        } else {
            log('点到了 comment cell')
        }
    })
}

var bindEventCommentUpdate = function() {
    var commentList = e('#id-weibo-list')
    commentList.addEventListener('click', function(event) {
        log(event)
        var self = event.target
        log('被点击的元素', self)
        log(self.classList)
        if (self.classList.contains('comment-update')) {
            log('点到了更新按钮')
            commentCell = self.closest('.comment-cell')
            commentId = commentCell.dataset['id']
            log('update comment id', commentId)
            input = e('.comment-update-input', commentCell)
            content = input.value
            var form = {
                id: commentId,
                content: content,
            }
            log('发送的form:', form)
            apiCommentUpdate(form, function(comment) {
                log('apiCommentUpdate', comment)

                var commentSpan = e('.class-comment-content', commentCell)
                commentSpan.innerText = comment.content

                var updateForm = e('.comment-update-form', commentCell)
                updateForm.remove()
            })
        } else {
            log('点到了 comment cell')
        }
    })
}


var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventCommentAdd()
    bindEventCommentDelete()
    bindEventCommentEdit()
    bindEventCommentUpdate()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()