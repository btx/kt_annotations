import jinja2
import os
import webapp2

from google.appengine.api import users


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))


class HelloHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            url = users.create_logout_url(self.request.uri)
        else:
            url = users.create_login_url(self.request.uri)

        template_values = {
            'users': users,
            'user': user,
            'url': url,
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))


class StoreHandler(webapp2.RedirectHandler):
    def post(self):
        self.response.write(self.request)


app = webapp2.WSGIApplication([
    ('/', HelloHandler),
    ('/store', StoreHandler),
], debug=True)
