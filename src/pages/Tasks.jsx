import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StacksMainnet } from '@stacks/network';

import { STACKSONE_MAINNET, StacksOneClient } from '../../index.js';
import { userSession } from '../supabaseClient';

const network = new StacksMainnet();
const client = new StacksOneClient({
  network,
  deployer: STACKSONE_MAINNET.deployer,
  contracts: STACKSONE_MAINNET.contracts,
});

const Tasks = ({ initialTasks = [], handleTask }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());
  const refreshTimers = useRef(new Set());

  const syncTaskStatusFromBlockchain = useCallback(async () => {
    if (!userSession.isUserSignedIn() || initialTasks.length === 0) {
      setTasks(initialTasks);
      return;
    }

    const userData = userSession.loadUserData();
    const userAddress = userData?.profile?.stxAddress?.mainnet;
    if (!userAddress) return;

    setLoadingTasks(true);

    try {
      const updatedTasks = await Promise.all(
        initialTasks.map(async (task) => {
          try {
            const completed = await client.isTaskDone(userAddress, task.id);
            return { ...task, completed };
          } catch (error) {
            console.warn(`Failed to fetch status for task ${task.id}:`, error);
            return task;
          }
        }),
      );

      setTasks(updatedTasks);
      setPendingTaskIds((current) => {
        const next = new Set(current);
        updatedTasks.forEach((task) => {
          if (task.completed) next.delete(task.id);
        });
        return next;
      });
    } catch (error) {
      console.error('Error syncing mission status:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, [initialTasks]);

  const scheduleRefresh = useCallback((delay) => {
    const timerId = window.setTimeout(async () => {
      refreshTimers.current.delete(timerId);
      await syncTaskStatusFromBlockchain();
    }, delay);

    refreshTimers.current.add(timerId);
  }, [syncTaskStatusFromBlockchain]);

  useEffect(() => {
    syncTaskStatusFromBlockchain();
  }, [syncTaskStatusFromBlockchain]);

  useEffect(() => () => {
    refreshTimers.current.forEach((timerId) => window.clearTimeout(timerId));
    refreshTimers.current.clear();
  }, []);

  const onTaskClick = async (taskId) => {
    if (pendingTaskIds.has(taskId)) return;

    const submitted = await handleTask(taskId);
    if (!submitted) return;

    setPendingTaskIds((current) => new Set(current).add(taskId));

    // A submitted transaction is not yet confirmed. Reconcile with on-chain
    // state instead of marking the mission as completed optimistically.
    scheduleRefresh(20_000);
    scheduleRefresh(60_000);
  };

  return (
    <div className="space-y-6 relative">
      {loadingTasks && (
        <div className="absolute -top-10 right-0 flex items-center text-xs text-indigo-400 animate-pulse">
          Syncing with Stacks mainnet...
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Mission Board</h2>
        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
          {tasks.filter((task) => task.completed).length}/{tasks.length} COMPLETE
        </span>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const pending = pendingTaskIds.has(task.id);

          return (
            <div
              key={task.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg ${
                    task.completed ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.completed ? '✓' : task.icon || '📋'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                      {task.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{task.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-indigo-400 font-bold font-mono mb-2">+{task.reward} XP</div>
                  <button
                    onClick={() => onTaskClick(task.id)}
                    disabled={task.completed || pending || loadingTasks}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      task.completed
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : pending
                          ? 'bg-amber-500/20 text-amber-300 cursor-wait'
                          : 'bg-white text-black hover:bg-indigo-400 hover:text-white'
                    } ${loadingTasks && !task.completed ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {task.completed ? 'Claimed' : pending ? 'Pending' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
