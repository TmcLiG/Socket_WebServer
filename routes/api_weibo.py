from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.comment import Comment
from routes import login_required

def all(request):
    # weibos = Weibo.all_json()
    weibos = Weibo.all()
    ws = []
    for weibo in weibos:
        comments = weibo.comments()
        list = []
        for comment in comments:
            comment.username = comment.user().username
            list.append(comment.json())
        w = dict(
            content = weibo.content,
            created_time =  weibo.created_time,
            updated_time = weibo.updated_time,
            id = weibo.id,
            comments=list,
        )
        ws.append(w)
    return json_response(ws)


def add(request):
    form = request.json()
    u = current_user(request)
    t = Weibo.add(form, u.id)
    return json_response(t.json())

def delete(request):
    weibo_id = int(request.query['id'])
    Comment.delete_comment(weibo_id)
    Weibo.delete(weibo_id)
    d = dict(
        message="成功删除 weibo"
    )
    return json_response(d)

def update(request):
    form = request.json()
    log('api weibo update form', form)
    t = Weibo.update(**form)
    return json_response(t.json())

def comment_add(request):
    form = request.json()
    u = current_user(request)
    t = Comment.add(form, u.id, u.username)
    return json_response(t.json())

def comment_delete(request):
    comment_id = int(request.query['id'])
    Comment.delete(comment_id)
    d = dict(
        message="成功删除 comment"
    )
    return json_response(d)

def comment_update(request):
    form = request.json()
    log('响应的api comment update form：', form)
    t = Comment.update(**form)
    return json_response(t.json())

def weibo_owner_required(route_function):
    def f(request):
        u = current_user(request)
        if 'id' in request.query:
            weibo_id = request.query['id']
        else:
            weibo_id = request.json()['id']
        w = Weibo.find_by(id=int(weibo_id))
        if w.user_id == u.id:
            return route_function(request)
        else:
            result = dict(
                message="fail"
            )
            return json_response(result)
    return f

def comment_owner_required(route_function):
    def f(request):
        u = current_user(request)
        if 'id' in request.query:
            weibo_id = request.query['id']
        else:
            weibo_id = request.json()['id']
        c = Comment.find_by(id=int(weibo_id))
        if c.user_id == u.id:
            return route_function(request)
        else:
            result = dict(
                message="fail"
            )
            return json_response(result)
    return f

def route_dict():
    d = {
        '/api/weibo/all': login_required(all),
        '/api/weibo/add': login_required(add),
        '/api/weibo/delete': login_required(weibo_owner_required(delete)),
        '/api/weibo/update': login_required(weibo_owner_required(update)),
        '/api/weibo/comment/add': login_required(comment_add),
        '/api/comment/delete': login_required(comment_owner_required(comment_delete)),
        '/api/comment/update': login_required(comment_owner_required(comment_update)),
    }
    return d