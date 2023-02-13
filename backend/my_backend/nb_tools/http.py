import urllib3
from urllib.parse import urlencode
import json
import time
import copy
from pprint import pprint


class Caller:

    adr_str = "{proto}://{client}:{port}{slug}{tail}" # how the address is formed

    def __init__(self, proto="http", client = "localhost", slug="/", port = 8000):
        self.proto = proto
        self.client = client
        self.slug = slug
        self.port = port
        self.http = urllib3.PoolManager()
        self.reset()
        self.setJsonHeaders()

    def setJsonHeaders(self):
        # self.headers = {'Content-Type':'application/json'}
        self.headers = {}
        
    def addHeader(self, key, value):
        self.headers[key] = value

    def reset(self):
        self.cookie = None

    def __str__(self):
        st =  "TARGET  : "+self.adr_str.format(
            proto = self.proto,
            client = self.client,
            port = str(self.port),
            slug = self.slug,
            tail =""
        ) + "\n"
        st += "HEADERS : " + str(self.headers) + "\n"
        st += "COOKIE  : "
        if self.cookie is not None:
            st += self.cookie
        st += "\n"
        return st


    def req(self, req_ = "GET", tail = "", json_ = None, pars = None, verbose = False):
        """Sends an HTTP POST with json data
        
        port 8080 for the docker version, otherwise 6543

        :param json: a dictionary, if defined, "Content-Type" will be "application/json" & the json data is dumped into req body
        :param pars: a dictionary, if defined, added url encoded into the request tail
        """
        slug = self.slug
        if pars is not None:
            tail += "?"+urlencode(pars)

        st = self.adr_str.format(
            proto = self.proto,
            client = self.client,
            port = str(self.port),
            tail = tail,
            slug = slug
        )
        if verbose:
            print(st)

        headers = {}
        headers.update(self.headers)
        if self.cookie is not None:
            headers.update({"Cookie" : self.cookie})

        args=(req_, st)
        kwargs={"headers": self.headers}
        if json_ is not None:
            headers.update({'Content-Type':'application/json'})
            json_payload = json.dumps(json_)
            kwargs["body"] = json_payload

        resp = self.http.request(*args, **kwargs)
        if resp.status == 200:
            if 'Set-Cookie' in resp.getheaders():
                self.cookie = resp.getheaders()["Set-Cookie"]
            """i.e. server responds in the headers with "Set-Cookie".  Next time
            when we call, we must set "Cookie" in the headers
            """
        if resp.status != 200 or verbose:
            print(resp)
            print(resp.status)
            print(resp.getheaders())
            # print(resp.data)
            print("data length:", len(resp.data))
        return resp.data

    def get(self, tail = "", json_ = None, pars=None, verbose = False):
        return self.req(req_ = "GET", tail = tail, json_ = json_, pars = pars, verbose = verbose)
        
    def put(self, tail = "", json_ = None, pars=None, verbose = False):
        return self.req(req_ = "PUT", tail = tail, json_ = json_, pars = pars, verbose = verbose)

    def delete(self, tail = "", json_ = None, pars=None, verbose = False):
        return self.req(req_ = "DELETE", tail = tail, json_ = json_, pars = pars, verbose = verbose)

    def post(self, tail ="", json_ = None, pars=None, verbose = False):
        return self.req(req_ = "POST", tail = tail, json_ = json_, pars = pars, verbose = verbose)
    
    def postJSON(self, tail: str ="", json_: dict = {}, verbose: bool = False):
        """Sends an HTTP POST with json data in the body, i.e. 'Content-Type' == 'application/json'
        
        port 8080 for the docker version, otherwise 6543
        """
        json_payload = json.dumps(json_)

        st = self.adr_str.format(
            proto = self.proto,
            client = self.client,
            port = str(self.port),
            tail = tail,
            slug = self.slug
        )
        if verbose:
            print(st)

        headers = {}
        headers.update(self.headers)
        headers.update({'Content-Type':'application/json'})
        if self.cookie is not None:
            headers.update({"Cookie" : self.cookie})
        resp = self.http.request(
            'POST', 
            st, 
            body = json_payload, 
            headers = self.headers
        )
        if resp.status == 200:
            if 'Set-Cookie' in resp.getheaders():
                self.cookie = resp.getheaders()["Set-Cookie"]
            """i.e. server responds in the headers with "Set-Cookie".  Next time
            when we call, we must set "Cookie" in the headers
            """
        if resp.status != 200 or verbose:
            print(resp)
            print(resp.status)
            print(resp.getheaders())
            # print(resp.data)
            print("data length:", len(resp.data))
        try:
            res = json.loads(resp.data.decode("utf-8"))
        except Exception as e:
            print("could not convert response data to json:", e)
            print(resp.data)
            res = resp
        return res


    def postFORM(self, tail: str ="", json_: dict = {}, verbose: bool = False):
        """Sends an HTTP POST with "x-www-form-urlencoded" form data, as per here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
        """
        st = self.adr_str.format(
            proto = self.proto,
            client = self.client,
            port = str(self.port),
            tail = tail,
            slug = self.slug
        )
        if verbose:
            print(st)

        headers = {}
        headers.update(self.headers)
        if self.cookie is not None:
            headers.update({"Cookie" : self.cookie})
        """ # no f-way to make this work
        headers.update({'Content-Type':'application/x-www-form-urlencoded'})
        headers.update({'Content-Length': len(json_payload)})

        json_payload = urlencode(json_)

        print(">", headers)
        print(">", json_payload)
        resp = self.http.request(
            'POST', 
            st, 
            body = json_payload, 
            headers = self.headers
        )
        """
        # as per: https://urllib3.readthedocs.io/en/1.26.3/reference/urllib3.request.html
        resp = self.http.request_encode_body(
            'POST',
            st,
            fields = json_,
            headers = self.headers
        )

        if resp.status == 200:
            if 'Set-Cookie' in resp.getheaders():
                self.cookie = resp.getheaders()["Set-Cookie"]
            """i.e. server responds in the headers with "Set-Cookie".  Next time
            when we call, we must set "Cookie" in the headers
            """
        if resp.status != 200 or verbose:
            print(resp)
            print(resp.status)
            print(resp.getheaders())
            # print(resp.data)
            print("data length:", len(resp.data))
        try:
            res = json.loads(resp.data.decode("utf-8"))
        except Exception as e:
            print("could not convert response data to json:", e)
            print(resp.data)
            res = resp
        return res


    def postFile(self, filename, tail="", verbose = False):
        st = self.adr_str.format(
            proto = self.proto,
            client = self.client,
            port = str(self.port),
            tail = tail,
            slug = self.slug
        )
        if verbose:
            print(st)

        with open(filename, "rb") as fp:
            file_data = fp.read()
        
        headers = {}
        headers.update(self.headers)
        if self.cookie is not None:
            headers.update({"Cookie" : self.cookie})
        resp = self.http.request(
            'POST',
            st,
            fields={
                'file': (filename, file_data),
            },
            headers = headers
        )
        """that will result in a POST multipart: (assume filename "example.txt")

        ::

            Content-Disposition: form-data; name="file"; filename="example.txt"
        """
        if resp.status == 200:
            if 'Set-Cookie' in resp.getheaders():
                self.cookie = resp.getheaders()["Set-Cookie"]
            """i.e. server responds in the headers with "Set-Cookie".  Next time
            when we call, we must set "Cookie" in the headers
            """
        if resp.status != 200 or verbose:
            print(resp)
            print(resp.status)
            print(resp.getheaders())
            print("data length:", len(resp.data))
        try:
            res = json.loads(resp.data.decode("utf-8"))
        except Exception as e:
            print("could not convert response data to json:", e)
            print(resp.data)
            res = resp
        return res
