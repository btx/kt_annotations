SHELL = /bin/sh
CLOSURE_PATH=static

all:
	java -jar ${CLOSURE_PATH}/plovr.jar serve ${CLOSURE_PATH}/main.json
build:
	java -jar ${CLOSURE_PATH}/plovr.jar build ${CLOSURE_PATH}/main.json > ${CLOSURE_PATH}/index.js
