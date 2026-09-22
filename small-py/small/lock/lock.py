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
from concurrent.futures.thread import ThreadPoolExecutor
from types import TracebackType
from typing import Optional, Type

from ..utils import final


class _ThreadingLock(threading.Lock):
    """ Threading.Lock wrapped for 'async with' (loop-agnostic) """

    # dedicated executor for waiting on the OS lock; shared by all
    # instances, so that waiting never starves the default thread pool
    # that the actual file IO runs in
    _executor = ThreadPoolExecutor(max_workers=32)

    def __init__(self):
        super().__init__()
        self.__lock = threading.Lock()

    async def acquire(self, blocking: bool = True, timeout: float = -1) -> bool:
        if not blocking:
            # non-blocking: no need to go through the executor
            return self.__lock.acquire(False)
        loop = asyncio.get_event_loop()
        # wait for the OS lock in a dedicated executor, never blocking
        # the default pool that the actual file IO runs in
        return await loop.run_in_executor(_ThreadingLock._executor,
                                          self.__lock.acquire, True, timeout)

    def release(self):
        self.__lock.release()

    def locked(self) -> bool:
        return self.__lock.locked()

    async def __aenter__(self):
        await self.acquire()
        return self

    async def __aexit__(self, exc_type: Optional[Type[BaseException]],
                        exc_val: Optional[BaseException],
                        exc_tb: Optional[TracebackType]):
        self.release()


class LockFactory:
    """ Lock Creator """

    # noinspection PyMethodMayBeStatic
    def create_lock(self, name: str):  # -> Optional[Lock]:
        if name == 'async-threading':
            return _ThreadingLock()
        elif name == 'asyncio':
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
    def create(cls, name: str = 'async-threading'):  # -> Optional[Lock]:
        return cls.factory.create_lock(name=name)


@final
class SyncLock:
    """ Global static Lock facade """

    factory = LockFactory()

    @classmethod
    def create(cls, name: str = 'threading'):  # -> Optional[Lock]:
        return cls.factory.create_lock(name=name)
