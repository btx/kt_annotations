import json
import jinja2
import os
import webapp2

from google.appengine.api import search, users


# TODO: add comments - py + js


DEVEL_ENVIRONMENT = os.environ['SERVER_SOFTWARE'].startswith('Development')
DEVEL_ENVIRONMENT = False
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__),
                                                'templates')))
_INDEX_NAME = "annotations"


def user_required(handler):
    """
    Decorator that checks if there's a user associated with
    the current session. Will also fail if there's no session present.
    """
    def check_login(self, *args, **kwargs):
        if not users.get_current_user():
            self.error(401)
        else:
            return handler(self, *args, **kwargs)

    return check_login


class HomeHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            url = users.create_logout_url(self.request.uri)
        else:
            url = users.create_login_url(self.request.uri)

        context = {
            'users': users,
            'user': user,
            'url': url,
            'DEVEL_ENVIRONMENT': DEVEL_ENVIRONMENT,
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(context))


class AnnotationsHandler(webapp2.RequestHandler):
    def _prepare(self, results):
        data = []

        for result in results:
            item = {
                'id': result.doc_id,
            }
            for field in result.fields:
                if field.name == 'shapes':
                    item[field.name] = json.loads(field.value)
                else:
                    item[field.name] = field.value
            data.append(item)

        return data

    @user_required
    def get(self, annotation_id=None):
        query = ''

        query_options = search.QueryOptions(
            limit=1000,
            # returned_fields=['doc_id', 'text', 'src'],
            # snippeted_fields=['text'],
        )
        query_obj = search.Query(query_string=query, options=query_options)
        results = search.Index(name=_INDEX_NAME).search(query=query_obj)

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(self._prepare(results)))

    # TODO: handle errors properly
    @user_required
    def post(self):
        data = self.request.get('annotation')

        annotation = None

        try:
            annotation = json.loads(data)
        except ValueError:
            # invalid input
            pass
        else:
            doc = search.Document(
                doc_id=annotation.get('id', None),
                fields=[
                    search.TextField(name='text', value=annotation['text']),
                    search.TextField(name='src', value=annotation['src']),
                    search.TextField(name='context',
                                     value=annotation['context']),
                    search.TextField(name='shapes',
                                     value=json.dumps(annotation['shapes'])),
                ]
            )

            try:
                # raise search.Error()
                result = search.Index(name=_INDEX_NAME).put(doc)
            except search.Error:
                # logging.exception('Put failed')
                pass
            else:
                annotation['id'] = result[0].id

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(annotation))

    @user_required
    def delete(self, annotation_id):
        index = search.Index(name=_INDEX_NAME)
        index.delete(annotation_id)

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps('{}'))


app = webapp2.WSGIApplication([
    webapp2.Route(r'/', HomeHandler, name='home'),
    webapp2.Route(r'/annotations', AnnotationsHandler, name='annotation_list'),
    webapp2.Route(r'/annotations/<annotation_id:[-\w]+>', AnnotationsHandler,
                  name='annotation'),
], debug=True)
