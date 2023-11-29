@echo off

:start
cls
echo Do you want to compile global commands or just local commands? (1/2)
set /p choice=
if %choice% == 1 (
    goto global
) else (
    if %choice% == 2 (
        goto local
    ) else (
        goto start
    )
)

:global
cd ./../js/sub_programs
node ./deploy_commands_global.js
goto :eof


:local
cd ./../js/sub_programs
node ./deploy_commands_local.js
goto :eof
