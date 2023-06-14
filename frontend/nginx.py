#!/usr/bin/python3
import sys, os, shlex, time, shutil, argparse, configparser, logging
from pprint import pprint
from logging import config
from pathlib import Path
import subprocess


def genConfigFile(**kwargs):
    """Generate nginx config file

    Parameters and example values:

    :param tmpdir: path_to_logs_and_pids
    :param user: unix_user_name
    :param main_port: 8088
    :param root_dir: /path/to/dir
    :param index: index.html
    :param backend_slug: api_v1
    :param frontend: frontend
    :param backend: backend
    :param backend_port: 8080
    :param no_cache: optional argument: if present and True, 
        nginx tells browser not to cache content

    """
    if ("no_cache" in kwargs) and (kwargs["no_cache"] is True):
        cache_control_part="""
        # tell browser to not use cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache';
        if_modified_since off;
        expires off;
        etag off;
        """
    else:
        cache_control_part=""

    if "no_cache" in kwargs: kwargs.pop("no_cache")
    kwargs["cache_control_part"] = cache_control_part

    return """user {user};
    worker_processes  1;
    daemon off;
    error_log  {tmpdir}/error.log warn;
    pid        {tmpdir}/nginx.pid;
    events {{
        worker_connections  1024;
    }}

    http {{    
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';
        access_log    {tmpdir}/access.log  main;
        sendfile      on;
        keepalive_timeout  65;

        server {{
            listen {main_port};  # nginx listening in this port

            location / {{
                root   {root_dir};
                index  {index};
                client_max_body_size  500m;
                {cache_control_part}
            }}

            location /{backend_slug}/ {{
                client_max_body_size            500m;
                proxy_pass_request_headers      on;
                proxy_set_header Origin         http://{frontend};
                proxy_pass                      http://{backend}:{backend_port}/{backend_slug}/;
                {cache_control_part}
            }}

            location /docs {{
                client_max_body_size            500m;
                proxy_pass_request_headers      on;
                proxy_set_header Origin         http://{frontend};
                proxy_pass                      http://{backend}:{backend_port}/docs;
                {cache_control_part}
            }}

            #location /ws {{
            #    proxy_pass http://ws_service:ws_port;
            #    proxy_http_version 1.1;
            #    proxy_set_header Upgrade $http_upgrade;
            #    proxy_set_header Connection "upgrade";
            #}}
        }}
    }}
    """.format(**kwargs)

class CLI:
    """A configparser wrapper that does the following:

    In ctor, adds an .ini file as an argument

    After that, you can use the method ``add_argument`` to add more arguments in the
    normal way

    __call__ returns (parsed_arguments, cfg), where cfg is the data from configparser
    """
    def __init__(self, default_ini="../backend/my_backend/ini/model.ini"):
        comname = Path(sys.argv[0]).stem

        self.parser = argparse.ArgumentParser(usage="""
{name} [options]
        """.format(name=comname),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
        )
        self.parser.add_argument("--ini", action="store", type=str, required=False,
            default = default_ini, help=".ini configuration file")

    def add_argument(self, *args, **kwargs):
        self.parser.add_argument(*args, **kwargs)

    def getParser(self):
        return self.parser

    def __call__(self):
        parsed, unparsed = self.parser.parse_known_args()
        parsed.ini = os.path.abspath(parsed.ini)
        assert(os.path.exists(parsed.ini)), "can't find .ini file.  sure you defined absolute path?"
        print("using ini file", parsed.ini)
        for arg in unparsed:
            print("Unknow option", arg)
            sys.exit(2)
        cfg = configparser.ConfigParser()
        cfg.read(parsed.ini)
        try:
            logging.config.fileConfig(cfg, disable_existing_loggers=True)
        except Exception as e:
            print("there was error reading your .ini file.  Please check your logger definitions")
            print("failed with:", e)
            raise(e)
        return parsed, cfg


class NGWrapper:

    def __init__(self, tmpdir="/tmp/my_nginx_tmp", config_file="/tmp/my_nginx_tmp/nginx.conf"):
        # nginx -p $PWD -c config/nginx.conf -g 'error_log error.log;'
        self.comm = "nginx -p {tmpdir} -c {config_file} -g 'error_log error.log;'".format(
            tmpdir=tmpdir,
            config_file = config_file
        )
        error_logfile=os.path.join(tmpdir, "error.log")
        access_logfile=os.path.join(tmpdir, "access.log")
        print("error log in: ", error_logfile)
        print("access log in: ", access_logfile)
        try:
            os.remove(error_logfile)
        except FileNotFoundError:
            pass
        try:
            os.remove(access_logfile)
        except FileNotFoundError:
            pass

    def start(self):
        print("starting", self.comm)
        self.nginx_process = subprocess.Popen(
            shlex.split(self.comm)
        )

    def stop(self):
        self.nginx_process.terminate()
        print("closing nginx")
        self.nginx_process.wait()


def main():
    print()
    cli = CLI()
    cli.add_argument("--port", action="store", type=int, required=False,
        default=8086, help="final localhost serving point for nginx")
    cli.add_argument("--path", action="store", type=str, required=False,
        # default=os.path.join(os.environ["PWD"],"app"),
        default=os.environ["PWD"],
        help="root path for nginx html & js serving")
    cli.add_argument("--index", action="store", type=str, required=False,
        default="app.html", help="typically 'index.html' or 'app.html'")
    p, cfg = cli()

    print("root path  ", p.path)
    print("entry point", p.index)

    tmpdir="/tmp/my_nginx_tmp"
    st = genConfigFile(
        user=os.environ["USER"],
        tmpdir=tmpdir,
        main_port=p.port,
        root_dir=p.path,
        index=p.index,
        backend_slug="api_v1",
        frontend=cfg["Uvicorn"]["host"],
        backend=cfg["Uvicorn"]["host"],
        backend_port=int(cfg["Uvicorn"]["port"]),
        no_cache=True
    )
    # print(st)
    config_file="/tmp/my_nginx_tmp/nginx.conf"
    os.makedirs(tmpdir, exist_ok=True)
    with open(config_file,"w") as f:
        f.write(st)
    os.system("killall -9 nginx") # just in case this script was previously closed "dirty"
    w=NGWrapper(tmpdir=tmpdir, config_file=config_file)
    w.start()
    print("\n FRONTEND SERVING AT PORT", p.port,"\n")
    print(f"\nhttp://localhost:{p.port}\n")
    while True:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            print("CTRL-C")
            break
    print("bye!")
    w.stop()


if __name__ == "__main__":
    main()
