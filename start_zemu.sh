#!/bin/sh

IMAG=zondax/builder-zemu

docker run -it --rm \
-v `pwd`:/home/zondax/src \
--network=host \
${IMAG} \
bash
#/home/zondax/speculos/speculos.py \
#-s 'equip will roof matter pink blind book anxiety banner elbow sun young' \
#--display text \
#--color LAGOON_BLUE \
#/home/zondax/src/app/bin/app.elf
