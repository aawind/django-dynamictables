from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns("dynamictables.views",
    url("^$", "main", name="main"),
    url("^form/?$", "form", name="form"),
    url("^tests/?$", "tests", name="tests"),
)