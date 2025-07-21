import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [updateTime, setUpdateTime] = useState<string>('');
  const [blockSessions, setBlockSessions] = useState(false);
  const [blockRegulations, setBlockRegulations] = useState(false);
  const [restartService, setRestartService] = useState(false);
  const [updateScheduled, setUpdateScheduled] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Имитация данных системы
  const systemStats = {
    uptime: '15д 3ч 42м',
    memory: 78,
    cpu: 34,
    activeConnections: 142,
    status: 'Активен'
  };

  // Обновление времени и отсчета
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (updateScheduled && updateTime) {
        const targetTime = new Date(updateTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, targetTime - now);
        setTimeLeft(diff);
        
        if (diff <= 0) {
          setUpdateScheduled(false);
          setUpdateTime('');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [updateScheduled, updateTime]);

  const scheduleUpdate = () => {
    if (updateTime) {
      const targetTime = new Date(updateTime);
      const now = new Date();
      if (targetTime > now) {
        setUpdateScheduled(true);
        setTimeLeft(targetTime.getTime() - now.getTime());
      }
    }
  };

  const cancelUpdate = () => {
    setUpdateScheduled(false);
    setUpdateTime('');
    setTimeLeft(0);
  };

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCountdownColor = () => {
    if (!updateScheduled || timeLeft <= 0) return 'from-gray-500 to-gray-600';
    if (timeLeft < 300000) return 'from-red-500 to-red-600'; // < 5 минут
    if (timeLeft < 1800000) return 'from-orange-500 to-orange-600'; // < 30 минут
    if (timeLeft < 3600000) return 'from-yellow-500 to-yellow-600'; // < 1 час
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Микросервис Dashboard</h1>
          <p className="text-slate-600">Панель управления обновлениями и мониторинг системы</p>
          <div className="text-sm text-slate-500 mt-2">
            {currentTime.toLocaleString('ru-RU')}
          </div>
        </div>

        {/* Статистика системы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-slate-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Статус системы</p>
                  <p className="text-2xl font-bold text-slate-800">{systemStats.status}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-green-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Активность</p>
                  <p className="text-2xl font-bold text-slate-800">{systemStats.uptime}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Clock" className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-orange-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Загрузка ЦП</p>
                  <p className="text-2xl font-bold text-slate-800">{systemStats.cpu}%</p>
                  <Progress value={systemStats.cpu} className="mt-2" />
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Cpu" className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-purple-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Память</p>
                  <p className="text-2xl font-bold text-slate-800">{systemStats.memory}%</p>
                  <Progress value={systemStats.memory} className="mt-2" />
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="HardDrive" className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Блок отсчета времени - главный элемент */}
        <Card className={`border-2 ${updateScheduled ? 'border-transparent' : 'border-slate-200'} 
                        ${updateScheduled ? `bg-gradient-to-r ${getCountdownColor()}` : 'bg-white'} 
                        transform hover:scale-105 transition-all duration-300 shadow-lg`}>
          <CardContent className="p-8 text-center">
            {updateScheduled && timeLeft > 0 ? (
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Обновление запланировано</h2>
                <div className="text-6xl font-bold mb-4 font-mono tracking-wider">
                  {formatTimeLeft(timeLeft)}
                </div>
                <p className="text-xl opacity-90">до начала обновления</p>
                <div className="mt-6">
                  <Button 
                    onClick={cancelUpdate}
                    variant="secondary"
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Icon name="X" className="mr-2 h-5 w-5" />
                    Отменить обновление
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-slate-600">
                <Icon name="Calendar" className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h2 className="text-3xl font-bold mb-2 text-slate-800">Нет запланированных обновлений</h2>
                <p className="text-xl">Система работает в штатном режиме</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Панель управления обновлениями */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Настройки обновления */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center">
                <Icon name="Settings" className="mr-2 h-5 w-5 text-slate-600" />
                Планирование обновления
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Время запуска */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Время запуска обновления
                </label>
                <input
                  type="datetime-local"
                  value={updateTime}
                  onChange={(e) => setUpdateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Переключатели */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="Users" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Блокировка сеансов</p>
                      <p className="text-sm text-slate-600">Запретить новые подключения</p>
                    </div>
                  </div>
                  <Switch checked={blockSessions} onCheckedChange={setBlockSessions} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="FileText" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Блокировка регламентов</p>
                      <p className="text-sm text-slate-600">Остановить фоновые задачи</p>
                    </div>
                  </div>
                  <Switch checked={blockRegulations} onCheckedChange={setBlockRegulations} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="RotateCcw" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Рестарт службы</p>
                      <p className="text-sm text-slate-600">Перезапуск после обновления</p>
                    </div>
                  </div>
                  <Switch checked={restartService} onCheckedChange={setRestartService} />
                </div>
              </div>

              <Button 
                onClick={scheduleUpdate}
                disabled={!updateTime || updateScheduled}
                className="w-full"
                size="lg"
              >
                <Icon name="Play" className="mr-2 h-5 w-5" />
                Запланировать обновление
              </Button>
            </CardContent>
          </Card>

          {/* Статус и информация */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center">
                <Icon name="Info" className="mr-2 h-5 w-5 text-slate-600" />
                Информация о системе
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Активные подключения</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {systemStats.activeConnections}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Версия сервиса</span>
                <Badge variant="outline">v2.1.4</Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Последнее обновление</span>
                <span className="text-slate-800">15.07.2025 14:30</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">Статус обновлений</span>
                <Badge variant={updateScheduled ? "destructive" : "default"}>
                  {updateScheduled ? "Запланировано" : "Готов к обновлению"}
                </Badge>
              </div>

              {/* Быстрые действия */}
              <div className="pt-4 space-y-3">
                <h4 className="font-medium text-slate-800">Быстрые действия</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm">
                    <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                    Перезагрузить службу
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Download" className="mr-2 h-4 w-4" />
                    Экспорт логов
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Shield" className="mr-2 h-4 w-4" />
                    Проверка безопасности
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;