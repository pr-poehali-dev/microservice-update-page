import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface SystemData {
  version: string;
  status: string;
  cpu: number;
  users: number;
  updateTime: string;
  blockSessions: boolean;
  blockRegulations: boolean;
  restartService: boolean;
  deleteExtensions: boolean;
}

const Index = () => {
  const [systemData, setSystemData] = useState<SystemData>({
    version: '2.1.4',
    status: 'Активен',
    cpu: 34,
    users: 23,
    updateTime: '',
    blockSessions: false,
    blockRegulations: false,
    restartService: false,
    deleteExtensions: false
  });
  const [updateScheduled, setUpdateScheduled] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Загрузка данных с сервера
  const loadSystemData = async () => {
    try {
      const response = await fetch('http://arturios.matrix/status');
      if (response.ok) {
        const data = await response.json();
        setSystemData(data);
        // Проверяем, есть ли запланированное обновление
        if (data.updateTime) {
          const targetTime = new Date(data.updateTime);
          const now = new Date();
          if (targetTime > now) {
            setUpdateScheduled(true);
            setTimeLeft(targetTime.getTime() - now.getTime());
          }
        }
      } else {
        // Если API недоступно, устанавливаем статус как неактивный
        setSystemData(prev => ({ ...prev, status: 'Не активна' }));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // При ошибке сети также помечаем систему как неактивную
      setSystemData(prev => ({ ...prev, status: 'Не активна' }));
    }
  };

  // Загрузка данных при монтировании и каждые 5 секунд
  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Обновление времени и отсчета
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (updateScheduled && systemData.updateTime) {
        const targetTime = new Date(systemData.updateTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, targetTime - now);
        setTimeLeft(diff);
        
        if (diff <= 0) {
          setUpdateScheduled(false);
          updateSystemData({ updateTime: '' });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [updateScheduled, systemData.updateTime]);

  // Обновление данных на сервере
  const updateSystemData = async (updates: Partial<SystemData>) => {
    try {
      const response = await fetch('http://arturios.matrix/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSystemData(prev => ({ ...prev, ...updatedData }));
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  };

  const scheduleUpdate = async () => {
    if (systemData.updateTime) {
      const targetTime = new Date(systemData.updateTime);
      const now = new Date();
      if (targetTime > now) {
        await updateSystemData({
          updateTime: systemData.updateTime,
          blockSessions: systemData.blockSessions,
          blockRegulations: systemData.blockRegulations,
          restartService: systemData.restartService,
          deleteExtensions: systemData.deleteExtensions
        });
        setUpdateScheduled(true);
        setTimeLeft(targetTime.getTime() - now.getTime());
      }
    }
  };

  const cancelUpdate = async () => {
    setUpdateScheduled(false);
    setTimeLeft(0);
    await updateSystemData({ updateTime: '' });
  };

  const handleSwitchChange = (field: keyof SystemData, value: boolean) => {
    const updates = { [field]: value };
    setSystemData(prev => ({ ...prev, ...updates }));
    updateSystemData(updates);
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
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Панель управления сервером
          </h1>
          <p className="text-slate-600">
            {currentTime.toLocaleString('ru-RU')}
          </p>
        </div>

        {/* Статистика системы */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Версия сервиса</p>
                  <p className="text-2xl font-bold text-slate-900">{systemData.version}</p>
                </div>
                <Icon name="GitBranch" className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Статус системы</p>
                  <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">
                    {systemData.status}
                  </Badge>
                </div>
                <Icon name="Activity" className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">Загрузка ЦП</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Progress value={systemData.cpu} className="flex-1" />
                    <span className="text-sm font-semibold text-slate-900">{systemData.cpu}%</span>
                  </div>
                </div>
                <Icon name="Cpu" className="h-8 w-8 text-orange-500 ml-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Пользователи онлайн</p>
                  <p className="text-2xl font-bold text-slate-900">{systemData.users}</p>
                </div>
                <Icon name="Users" className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Планировщик обновлений */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Icon name="Clock" className="mr-2 h-5 w-5 text-blue-600" />
                Планировщик обновлений
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Время запуска обновления
                </label>
                <input
                  type="datetime-local"
                  value={systemData.updateTime}
                  onChange={(e) => {
                    const updates = { updateTime: e.target.value };
                    setSystemData(prev => ({ ...prev, ...updates }));
                    updateSystemData(updates);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="UserX" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Блокировка сеансов</p>
                      <p className="text-sm text-slate-600">Запретить новые подключения</p>
                    </div>
                  </div>
                  <Switch 
                    checked={systemData.blockSessions} 
                    onCheckedChange={(value) => handleSwitchChange('blockSessions', value)} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="Shield" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Блокировка регламентов</p>
                      <p className="text-sm text-slate-600">Отключить автоматические задачи</p>
                    </div>
                  </div>
                  <Switch 
                    checked={systemData.blockRegulations} 
                    onCheckedChange={(value) => handleSwitchChange('blockRegulations', value)} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="RotateCcw" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Рестарт службы</p>
                      <p className="text-sm text-slate-600">Перезапуск после обновления</p>
                    </div>
                  </div>
                  <Switch 
                    checked={systemData.restartService} 
                    onCheckedChange={(value) => handleSwitchChange('restartService', value)} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="Calendar" className="mr-3 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Удалить расширения с датой</p>
                      <p className="text-sm text-slate-600">Очистить временные расширения</p>
                    </div>
                  </div>
                  <Switch 
                    checked={systemData.deleteExtensions} 
                    onCheckedChange={(value) => handleSwitchChange('deleteExtensions', value)} 
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={scheduleUpdate}
                  disabled={!systemData.updateTime || updateScheduled}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Icon name="Play" className="mr-2 h-4 w-4" />
                  Запланировать обновление
                </Button>
                {updateScheduled && (
                  <Button 
                    onClick={cancelUpdate}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Icon name="X" className="mr-2 h-4 w-4" />
                    Отменить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Статус обновления */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Icon name="Timer" className="mr-2 h-5 w-5 text-green-600" />
                Статус обновления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {updateScheduled ? (
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getCountdownColor()} text-white text-2xl font-bold shadow-lg`}>
                    {formatTimeLeft(timeLeft)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">Обновление запланировано</p>
                    <p className="text-sm text-slate-600">
                      Начало: {new Date(systemData.updateTime).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white">
                    <Icon name="Calendar" className="h-12 w-12" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">Нет запланированных обновлений</p>
                    <p className="text-sm text-slate-600">Установите время и запустите планировщик</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            © 2024 Панель управления сервером • Разработано{' '}
            <a 
              href="https://t.me/Arturios" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              @Arturios
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;