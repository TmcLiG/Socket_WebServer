from models import Model
from models.user import User
# from models.weibo import Weibo
from models.user_role import (
    GuaEncoder,
    gua_decode,
)
import json
from utils import log


def save(data, path):
    """
    本函数把一个 dict 或者 list 写入文件
    data 是 dict 或者 list
    path 是保存文件的路径
    """
    # json 是一个序列化/反序列化(上课会讲这两个名词) list/dict 的库
    # indent 是缩进
    # ensure_ascii=False 用于保存中文
    s = json.dumps(data, indent=2, ensure_ascii=False, cls=GuaEncoder)
    with open(path, 'w+', encoding='utf-8') as f:
        log('save', path, s, data)
        f.write(s)


def load(path):
    """
    本函数从一个文件中载入数据并转化为 dict 或者 list
    path 是保存文件的路径
    """
    with open(path, 'r', encoding='utf-8') as f:
        s = f.read()
        log('load', s)
        return json.loads(s, object_hook=gua_decode)

class Comment(Model):
    """
    评论类
    """
    def __init__(self, form, user_id=-1):
        super().__init__(form)
        self.content = form.get('content', '')
        # 和别的数据关联的方式, 用 user_id 表明拥有它的 user 实例
        self.user_id = form.get('user_id', user_id)
        self.username = form.get('username', '')
        self.weibo_id = int(form.get('weibo_id', -1))


    def user(self):
        u = User.find_by(id=self.user_id)
        return u

    # def weibo(self):
    #     from models.weibo import Weibo
    #     w = Weibo.find_by(id=self.weibo_id)
    # return w
    @classmethod
    def add(cls, form, user_id, username):
        c = Comment(form)
        c.user_id = user_id
        c.username = username
        c.save()
        return c

    @classmethod
    def delete_comment(cls, id):
        ms = cls.all()
        for i, m in enumerate(ms):
            if m.weibo_id == id:
                del ms[i]

        l = [m.__dict__ for m in ms]
        path = cls.db_path()
        save(l, path)

