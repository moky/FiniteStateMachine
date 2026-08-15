# -*- coding: utf-8 -*-
#
#   Async Lock
#
#                                Written in 2026 by Moky <albert.moky@gmail.com>
#
# ==============================================================================
# MIT License
#
# Copyright (c) 2026 Albert Moky
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
# ==============================================================================

import asyncio
import multiprocessing
import threading

from ..utils import final


class LockFactory:
    """ Lock Creator """

    # noinspection PyMethodMayBeStatic
    def create_lock(self, name: str):
        if name == 'asyncio':
            return asyncio.Lock()
        elif name == 'threading':
            return threading.Lock()
        elif name == 'multiprocessing':
            return multiprocessing.Lock()
        else:
            assert name is None, 'unknown lock: %s' % name
            return None


@final
class AsyncLock:
    """ Global static Lock facade """

    factory = LockFactory()

    @classmethod
    def create(cls, name: str = 'asyncio'):
        return cls.factory.create_lock(name=name)


@final
class SyncLock:
    """ Global static Lock facade """

    factory = LockFactory()

    @classmethod
    def create(cls, name: str = 'threading'):
        return cls.factory.create_lock(name=name)
