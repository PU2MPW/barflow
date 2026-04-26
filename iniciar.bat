@echo off
title BarFlow - Servidor Local
echo ======================================
echo    BarFlow - Sistema de Gestao
echo ======================================
echo.
echo Iniciando servidor...
echo.
echo Acesse: http://localhost:8000
echo.
echo Pressione CTRL+C para parar
echo.
python -m http.server 8000
