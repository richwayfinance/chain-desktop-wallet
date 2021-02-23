TESTS_ZEMU_DIR?=$(CURDIR)/tests_zemu
TESTS_ZEMU_JS_PACKAGE?=
TESTS_ZEMU_JS_DIR?=


.PHONY: zemu_install_js_link
ifeq ($(TESTS_ZEMU_JS_DIR),)
zemu_install_js_link:
	@echo "No local package defined"
else
zemu_install_js_link:
	# First unlink everything
	cd $(TESTS_ZEMU_JS_DIR) && yarn unlink || true
	cd $(TESTS_ZEMU_DIR) && yarn unlink $(TESTS_ZEMU_JS_PACKAGE) || true
	# Now build and link
	cd $(TESTS_ZEMU_JS_DIR) && yarn install && yarn build || true
	cd $(TESTS_ZEMU_JS_DIR) && yarn link || true
	cd $(TESTS_ZEMU_DIR) && yarn link $(TESTS_ZEMU_JS_PACKAGE) || true
endif

.PHONY: zemu_install
zemu_install: zemu_install_js_link
	# and now install everything
	cd $(TESTS_ZEMU_DIR) && yarn install

.PHONY: zemu
zemu:
	cd $(TESTS_ZEMU_DIR)/tools && node debug.mjs

.PHONY: zemu_val
zemu_val:
	cd $(TESTS_ZEMU_DIR)/tools && node debug_val.mjs

.PHONY: zemu_debug
zemu_debug:
	cd $(TESTS_ZEMU_DIR)/tools && node debug.mjs debug

########################## TEST Section ###############################

.PHONY: zemu_test
zemu_test:
	cd $(TESTS_ZEMU_DIR) && yarn test
