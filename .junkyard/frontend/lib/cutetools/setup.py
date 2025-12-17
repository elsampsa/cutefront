from setuptools import setup
from pathlib import Path

# Read the contents of README.md if it exists
this_directory = Path(__file__).parent
readme_file = this_directory / "README.md"
long_description = ""
if readme_file.exists():
    long_description = readme_file.read_text(encoding='utf-8')

setup(
    name="cutetools",
    version="0.1.0",
    author="Your Name",  # Update this
    author_email="your.email@example.com",  # Update this
    description="A collection of utilities for working with JavaScript widget documentation",
    long_description=long_description,
    long_description_content_type="text/markdown",
    # url="nada",
    include_package_data=True,
    packages=["cutetools", "browser_automation"],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Documentation",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "playwright>=1.40.0",
        "PyYAML>=6.0",
    ],
    entry_points={
        "console_scripts": [
            "cute-get-api-tree=cutetools.get_api_tree:main",
            "cute-browser=browser_automation.__main__:main",
        ],
    },
    extras_require={
        "dev": [
            "pytest>=7.0",
            "black>=23.0",
            "flake8>=6.0",
        ],
    },
)
