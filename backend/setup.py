from setuptools import setup, Extension, find_packages
import sys

# The following line is modified by setver.bash
version = '0.0.0'

# # https://setuptools.readthedocs.io/en/latest/setuptools.html#basic-use
setup(
    name = "my-backend",
    version = version,
    install_requires = [
        "fastapi==0.73.0",
        "psycopg2==2.8.4",
        "alembic==1.7.6",
        "SQLAlchemy==1.4.11",
        "bcrypt==3.1.7",
        "uvicorn==0.17.1",
        "python-multipart==0.0.5"
    ],

    packages = find_packages(), # # includes python code from every directory that has an "__init__.py" file in it.  If no "__init__.py" is found, the directory is omitted.  Other directories / files to be included, are defined in the MANIFEST.in file
    
    include_package_data=True, # # conclusion: NEVER forget this : files get included but not installed
    # # "package_data" keyword is a practical joke: use MANIFEST.in instead
    
    # # WARNING: If you are using namespace packages, automatic package finding does not work, so use this:
    #packages=[
    #    'skeleton.subpackage1'
    #],
    
    #scripts=[
    #    "bin/somescript"
    #],

    # # "entry points" get installed into $HOME/.local/bin
    # # https://unix.stackexchange.com/questions/316765/which-distributions-have-home-local-bin-in-path
    entry_points={
        'console_scripts': [
            'my-backend = my_backend.cli:main' # this would create a command "my-command" that maps to skeleton.subpackage1.cli method "main"
        ]
    },
    
    # # enable this if you need to run a post-install script:
    #cmdclass={
    #  'install': PostInstallCommand,
    #  },
    
    # metadata for upload to PyPI
    author           = "Sampsa Riikonen",
    author_email     = "sampsa.riikonen@iki.fi",
    description      = "A template for fastapi fullstack projects",
    license          = "WTFPL",
    keywords         = "python fastapi",
    url              = "https://elsampsa.github.io/fastapi-scaffold/", # project homepage
    
    long_description ="""A template for fastapi backend projects
    """,
    long_description_content_type='text/plain',
    # long_description_content_type='text/x-rst', # this works
    # long_description_content_type='text/markdown', # this does not work
    
    classifiers      =[  # Optional
        # How mature is this project? Common values are
        #   3 - Alpha
        #   4 - Beta
        #   5 - Production/Stable
        'Development Status :: 3 - Alpha',
        # Indicate who your project is intended for
        'Intended Audience :: Developers',
        'Operating System :: POSIX :: Linux',
        # 'Topic :: Multimedia :: Video', # set a topic
        # Pick your license as you wish
        'License :: OSI Approved :: MIT License',
        # Specify the Python versions you support here. In particular, ensure
        # that you indicate whether you support Python 2, Python 3 or both.
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10'
    ],
    #project_urls={ # some additional urls
    #    'Tutorial': 'https://elsampsa.github.io/skeleton/'
    #},
)
