#! /usr/bin/env python
# -*- coding: utf-8 -*-

"""
    SM-AL-L Lib
    ~~~~~~~~~~~

    State Machine, Async Lock, Logger
"""

from setuptools import setup, find_packages

__version__ = '1.0.0'
__author__ = 'Albert Moky'
__contact__ = 'albert.moky@gmail.com'

with open('README.md', 'r') as fh:
    readme = fh.read()

setup(
    name='smallib',
    version=__version__,
    url='https://github.com/moky/FiniteStateMachine/',
    license='MIT',
    author=__author__,
    author_email=__contact__,
    description='State Machine, Async Lock, Logger',
    long_description=readme,
    long_description_content_type='text/markdown',
    packages=find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    install_requires=[
    ]
)
