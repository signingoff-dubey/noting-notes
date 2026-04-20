# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-20T01:28:07.902Z
> Files: 516 tracked | Anatomy hits: 0 | Misses: 0

## ../../../.claude/

- `CLAUDE.md` — graphify (~825 tok)

## ./

- `ARCHITECTURE.md` — ARCHITECTURE.md — NOTED (~2545 tok)
- `CLAUDE.md` — OpenWolf (~4427 tok)
- `design_styles.css` — Styles: 24 rules, 60 vars (~6110 tok)
- `DESIGN_SYSTEM.md` — DESIGN_SYSTEM.md — NOTED (~4011 tok)
- `design_template.html` — INK — Think local. Think deep. (~5846 tok)
- `FEATURES.md` — FEATURES.md — Competitive Intelligence (~5391 tok)
- `MILESTONES.md` — MILESTONES.md — Build Order for Claude Code (~2214 tok)
- `PRD.md` — PRD — NOTED (Working Title) (~5043 tok)
- `progress.md` — Progress Log — INK (~2829 tok)
- `run.bat` (~872 tok)

## .claude/

- `launch.json` (~60 tok)
- `settings.json` (~441 tok)
- `settings.local.json` — Declares m (~473 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## backend/

- `__init__.py` — NOTED backend package (~7 tok)
- `main.py` — API: GET (1 endpoints) (~361 tok)
- `requirements.txt` — Python dependencies (~30 tok)

## backend/models/

- `__init__.py` — models package (~5 tok)
- `ai.py` — Pydantic models for AI endpoints (stubs). (~162 tok)
- `folder.py` — Pydantic models for Folders. (~115 tok)
- `note.py` — Pydantic models for Notes. (~341 tok)
- `task.py` — Pydantic models for Tasks. (~332 tok)

## backend/routes/

- `__init__.py` — routes package (~5 tok)
- `ai.py` — AI routing (stubs). (~610 tok)
- `attachments.py` — Attachments routing. (~157 tok)
- `folders.py` — Folders routing. (~418 tok)
- `notes.py` — Notes routing. (~265 tok)
- `tasks.py` — Tasks routing. (~265 tok)
- `vault.py` — Vault routing (stubs). (~154 tok)

## backend/services/

- `__init__.py` — services package (~6 tok)
- `note_service.py` — Business logic for Notes. (~525 tok)
- `task_service.py` — Business logic for Tasks. (~466 tok)

## backend/storage/

- `__init__.py` — storage package (~6 tok)
- `store.py` — read_all_notes, read_note, write_note, delete_note + 17 more (~2608 tok)

## backend/venv/

- `.gitignore` — Git ignore rules (~19 tok)
- `pyvenv.cfg` (~56 tok)

## backend/venv/Lib/site-packages/

- `typing_extensions.py` — _Sentinel: final, done, done, disjoint_base + 1 more (~45837 tok)

## backend/venv/Lib/site-packages/_yaml/

- `__init__.py` — This is a stub package designed to roughly emulate the _yaml (~401 tok)

## backend/venv/Lib/site-packages/annotated_doc-0.0.4.dist-info/

- `entry_points.txt` (~9 tok)
- `INSTALLER` (~2 tok)
- `METADATA` — Declares attributes (~1751 tok)
- `RECORD` (~232 tok)
- `WHEEL` (~24 tok)

## backend/venv/Lib/site-packages/annotated_doc-0.0.4.dist-info/licenses/

- `LICENSE` — Project license (~290 tok)

## backend/venv/Lib/site-packages/annotated_doc/

- `__init__.py` (~15 tok)
- `main.py` — Doc: hi (~308 tok)
- `py.typed` (~0 tok)

## backend/venv/Lib/site-packages/annotated_types-0.7.0.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — Declares MyClass (~4013 tok)
- `RECORD` (~214 tok)
- `WHEEL` (~24 tok)

## backend/venv/Lib/site-packages/annotated_types-0.7.0.dist-info/licenses/

- `LICENSE` — Project license (~289 tok)

## backend/venv/Lib/site-packages/annotated_types/

- `__init__.py` — Declares from (~3949 tok)
- `py.typed` (~0 tok)
- `test_cases.py` — Test file (~1834 tok)

## backend/venv/Lib/site-packages/anyio-4.13.0.dist-info/

- `entry_points.txt` (~10 tok)
- `INSTALLER` (~2 tok)
- `METADATA` (~1203 tok)
- `RECORD` (~1669 tok)
- `top_level.txt` (~2 tok)
- `WHEEL` (~25 tok)

## backend/venv/Lib/site-packages/anyio-4.13.0.dist-info/licenses/

- `LICENSE` — Project license (~288 tok)

## backend/venv/Lib/site-packages/anyio/

- `__init__.py` — Declares as (~1763 tok)
- `from_thread.py` — _BlockingAsyncContextManager: run, run_sync, run_async_cm, started + 9 more (~5469 tok)
- `functools.py` — _InitialMissingType: cache_info, cache_parameters, cache_clear, cache_info + 12 more (~3451 tok)
- `lowlevel.py` — View: get, get, get (~1474 tok)
- `py.typed` (~0 tok)
- `pytest_plugin.py` — FreePortFactory: extract_backend_and_options, get_runner, pytest_addoption, pytest_configure + 10 more (~3650 tok)
- `to_interpreter.py` — _Worker: destroy, call, destroy, call + 4 more (~2029 tok)
- `to_process.py` — from: run_sync, send_raw_command, current_default_process_limiter, process_worker (~2800 tok)
- `to_thread.py` — run_sync, current_default_thread_limiter (~770 tok)

## backend/venv/Lib/site-packages/anyio/_backends/

- `__init__.py` (~0 tok)
- `_asyncio.py` — _State: close, get_loop, run, find_root_task + 2 more (~28422 tok)
- `_trio.py` — from: cancel, deadline, deadline, cancel_called + 25 more (~11819 tok)

## backend/venv/Lib/site-packages/anyio/_core/

- `__init__.py` (~0 tok)
- `_asyncio_selector_thread.py` — Selector: start, add_reader, add_writer, remove_reader + 3 more (~1608 tok)
- `_contextmanagers.py` — Declares _SupportsCtxMgr (~2062 tok)
- `_eventloop.py` — because: run, sleep, sleep_forever, sleep_until + 9 more (~1842 tok)
- `_exceptions.py` — BrokenResourceError: iterate_exceptions (~1260 tok)
- `_fileio.py` — from: wrapped, aclose, read, read1 + 35 more (~7333 tok)
- `_resources.py` — aclose_forcefully (~125 tok)
- `_signals.py` — open_signal_receiver (~291 tok)
- `_sockets.py` — URL configuration (~9992 tok)
- `_streams.py` — Declares create_memory_object_stream (~516 tok)
- `_subprocesses.py` — run_process, drain_stream, open_process (~2262 tok)
- `_synchronization.py` — from: set, is_set, wait, statistics + 29 more (~6018 tok)
- `_tasks.py` — _IgnoredTaskStatus: started, cancel, deadline, deadline + 8 more (~1553 tok)
- `_tempfile.py` — TemporaryFile: aclose, rollover, closed, read + 6 more (~5607 tok)
- `_testing.py` — TaskInfo: has_pending_cancellation, get_current_task, get_running_tasks, wait_all_tasks_blocked (~669 tok)
- `_typedattr.py` — TypedAttributeSet: typed_attribute, extra_attributes, extra, extra + 1 more (~717 tok)

## backend/venv/Lib/site-packages/anyio/abc/

- `__init__.py` (~820 tok)
- `_eventloop.py` — AsyncBackend: run, current_token, current_time, cancelled_exception_class + 43 more (~3037 tok)
- `_resources.py` — AsyncResource: aclose (~224 tok)
- `_sockets.py` — SocketAttribute: extra_attributes, from_socket, from_socket, send_fds + 9 more (~3750 tok)
- `_streams.py` — UnreliableObjectReceiveStream: receive, send, send_eof, receive + 5 more (~2138 tok)
- `_subprocesses.py` — Process: wait, terminate, kill, send_signal + 5 more (~591 tok)
- `_tasks.py` — TaskStatus: started, started, started, start_soon + 1 more (~1064 tok)
- `_testing.py` — TestRunner: run_asyncgen_fixture, run_fixture, run_test (~521 tok)

## backend/venv/Lib/site-packages/anyio/streams/

- `__init__.py` (~0 tok)
- `buffered.py` — BufferedByteReceiveStream: aclose, buffer, extra_attributes, feed_data + 6 more (~1790 tok)
- `file.py` — URL configuration (~1266 tok)
- `memory.py` — MemoryObjectStreamStatistics: statistics, receive_nowait, receive, clone + 9 more (~3069 tok)
- `stapled.py` — from: receive, send, send_eof, aclose + 9 more (~1255 tok)
- `text.py` — TextReceiveStream: receive, aclose, extra_attributes, send + 8 more (~1648 tok)
- `tls.py` — from: wrap, unwrap, aclose, receive + 4 more (~4373 tok)

## backend/venv/Lib/site-packages/certifi-2026.2.25.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` (~660 tok)
- `RECORD` (~273 tok)
- `top_level.txt` (~2 tok)
- `WHEEL` (~25 tok)

## backend/venv/Lib/site-packages/certifi-2026.2.25.dist-info/licenses/

- `LICENSE` — Project license (~264 tok)

## backend/venv/Lib/site-packages/certifi/

- `__init__.py` (~27 tok)
- `__main__.py` (~70 tok)
- `cacert.pem` — Issuer: CN=QuoVadis Root CA 2 O=QuoVadis Limited (~72651 tok)
- `core.py` — URL patterns: 3 routes (~970 tok)
- `py.typed` (~0 tok)

## backend/venv/Lib/site-packages/click-8.3.2.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — Declares toolkit (~699 tok)
- `RECORD` (~675 tok)
- `WHEEL` (~22 tok)

## backend/venv/Lib/site-packages/click-8.3.2.dist-info/licenses/

- `LICENSE.txt` (~369 tok)

## backend/venv/Lib/site-packages/click/

- `__init__.py` (~1278 tok)
- `_compat.py` — URL configuration (~5341 tok)
- `_termui_impl.py` — ProgressBar: render_finish, pct, time_per_iteration, eta + 11 more (~7741 tok)
- `_textwrap.py` — TextWrapper: extra_indent, indent_only (~400 tok)
- `_utils.py` — Declares import (~270 tok)
- `_winconsole.py` — This module is based on the excellent work by Adam Bartoš who (~2419 tok)
- `core.py` — ParameterSource: batch, augment_usage_errors, iter_params_for_processing, sort_key (~37973 tok)
- `decorators.py` — to: pass_context, new_func, pass_obj, new_func + 24 more (~5275 tok)
- `exceptions.py` — ClickException: format_message, show, show, format_message + 4 more (~2844 tok)
- `formatting.py` — Can force a width.  This is used by the test system (~2780 tok)
- `globals.py` — get_current_context, get_current_context, get_current_context, push_context + 2 more (~550 tok)
- `parser.py` — _Option: takes_value, process, process, add_option + 2 more (~5432 tok)
- `py.typed` (~0 tok)
- `shell_completion.py` — CompletionItem: shell_complete, func_name, source_vars, source + 9 more (~5999 tok)
- `termui.py` — hidden_prompt_func, prompt, prompt_func, confirm + 4 more (~8868 tok)
- `testing.py` — EchoingStdin: read, read1, readline, readlines + 15 more (~5423 tok)
- `types.py` — ParamType: to_info_dict, get_metavar, get_missing_message, convert + 14 more (~11408 tok)
- `utils.py` — URL configuration (~5788 tok)

## backend/venv/Lib/site-packages/colorama-0.4.6.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — multiple: all (~4574 tok)
- `RECORD` (~580 tok)
- `WHEEL` (~28 tok)

## backend/venv/Lib/site-packages/colorama-0.4.6.dist-info/licenses/

- `LICENSE.txt` (~373 tok)

## backend/venv/Lib/site-packages/colorama/

- `__init__.py` (~76 tok)
- `ansi.py` — AnsiCodes: code_to_chars, set_title, clear_screen, clear_line + 5 more (~721 tok)
- `ansitowin32.py` — StreamWrapper: write, isatty, closed, should_wrap + 10 more (~3180 tok)
- `initialise.py` — reset_all, init, deinit, just_fix_windows_console + 3 more (~950 tok)
- `win32.py` — from winbase.h (~1766 tok)
- `winterm.py` — WinColor: get_osfhandle, get_attrs, set_attrs, reset_all + 11 more (~2039 tok)

## backend/venv/Lib/site-packages/colorama/tests/

- `__init__.py` (~22 tok)
- `ansi_test.py` — Test file (~812 tok)
- `ansitowin32_test.py` — Tests: closed_shouldnt_raise_on_closed_stream, closed_shouldnt_raise_on_detached_stream, reset_all_shouldnt_raise_on_closed_orig_stdout, wrap_shoul... (~3051 tok)
- `initialise_test.py` — Test file (~1926 tok)
- `isatty_test.py` — Tests: TTY, nonTTY, withPycharm, withPycharmTTYOverride + 3 more (~534 tok)
- `utils.py` — StreamTTY: isatty, isatty, osname, replace_by + 2 more (~309 tok)
- `winterm_test.py` — Test file (~1060 tok)

## backend/venv/Lib/site-packages/dotenv/

- `__init__.py` — load_ipython_extension, get_cli_string (~352 tok)
- `__main__.py` — Entry point for cli, enables execution with `python -m dotenv` (~37 tok)
- `cli.py` — enumerate_env, cli, stream_file, list_values + 5 more (~1870 tok)
- `ipython.py` — class: dotenv, load_ipython_extension (~379 tok)
- `main.py` — A type alias for a string path to be used for the paths in this file. (~4196 tok)
- `parser.py` — Original: make_regex, start, set, advance + 13 more (~1480 tok)
- `py.typed` — Marker file for PEP 561 (~7 tok)
- `variables.py` — Atom: resolve, resolve, resolve, parse_variables (~671 tok)
- `version.py` (~7 tok)

## backend/venv/Lib/site-packages/fastapi-0.136.0.dist-info/

- `entry_points.txt` (~16 tok)
- `INSTALLER` (~2 tok)
- `METADATA` — Declares hints (~7602 tok)
- `RECORD` (~2042 tok)
- `REQUESTED` (~0 tok)
- `WHEEL` (~24 tok)

## backend/venv/Lib/site-packages/fastapi-0.136.0.dist-info/licenses/

- `LICENSE` — Project license (~290 tok)

## backend/venv/Lib/site-packages/fastapi/

- `__init__.py` — FastAPI framework, high performance, easy to learn, fast to code, ready for production (~309 tok)
- `__main__.py` (~11 tok)
- `applications.py` — API: GET (2 endpoints) (~51848 tok)
- `background.py` — API: POST (1 endpoints) (~520 tok)
- `cli.py` — main (~130 tok)
- `concurrency.py` — contextmanager_in_threadpool (~426 tok)
- `datastructures.py` — API: POST (2 endpoints) (~1521 tok)
- `encoders.py` — isoformat, decimal_encoder, generate_encoders_by_class_tuples, jsonable_encoder (~3193 tok)
- `exception_handlers.py` — http_exception_handler, request_validation_exception_handler, websocket_request_validation_exception_handler (~365 tok)
- `exceptions.py` — API: GET (1 endpoints) (~2130 tok)
- `logger.py` (~16 tok)
- `param_functions.py` — API: GET (1 endpoints) (~19885 tok)
- `params.py` — Declares from (~7508 tok)
- `py.typed` (~0 tok)
- `requests.py` (~41 tok)
- `responses.py` — _UjsonModule: dumps, dumps, render, render (~1199 tok)
- `routing.py` — _AsyncLiftContextManager: request_response, app, app, websocket_session + 7 more (~56466 tok)
- `sse.py` — Canonical SSE event schema matching the OpenAPI 3.2 spec (~1827 tok)
- `staticfiles.py` (~20 tok)
- `templating.py` (~22 tok)
- `testclient.py` (~19 tok)
- `types.py` — Declares import (~126 tok)
- `utils.py` — URL configuration (~1241 tok)
- `websockets.py` (~64 tok)

## backend/venv/Lib/site-packages/fastapi/.agents/skills/fastapi/

- `SKILL.md` — FastAPI (~2597 tok)

## backend/venv/Lib/site-packages/fastapi/.agents/skills/fastapi/references/

- `dependencies.md` — Dependency Injection (~816 tok)
- `other-tools.md` — Other Tools (~382 tok)
- `streaming.md` — Streaming (~646 tok)

## backend/venv/Lib/site-packages/fastapi/_compat/

- `__init__.py` — Declares as (~606 tok)
- `shared.py` — from: lenient_issubclass, field_annotation_is_sequence, value_is_sequence, field_annotation_is_complex + 9 more (~2013 tok)
- `v2.py` — Pydantic model (31 fields) (~4889 tok)

## backend/venv/Lib/site-packages/fastapi/dependencies/

- `__init__.py` (~0 tok)
- `models.py` — class: oauth_scopes, cache_key, is_gen_callable, is_async_gen_callable + 2 more (~2072 tok)
- `utils.py` — from: ensure_multipart_is_installed, get_parameterless_sub_dependant, get_flat_dependant, get_flat_params + 5 more (~11322 tok)

## backend/venv/Lib/site-packages/fastapi/middleware/

- `__init__.py` (~17 tok)
- `asyncexitstack.py` — Used mainly to close files after the request is done, dependencies are closed (~182 tok)
- `cors.py` (~23 tok)
- `gzip.py` (~23 tok)
- `httpsredirect.py` (~33 tok)
- `trustedhost.py` (~32 tok)
- `wsgi.py` (~31 tok)

## backend/venv/Lib/site-packages/fastapi/openapi/

- `__init__.py` (~0 tok)
- `constants.py` (~44 tok)
- `docs.py` — get_swagger_ui_html, get_redoc_html, get_swagger_ui_oauth2_redirect_html (~3550 tok)
- `models.py` — Pydantic: BaseModelWithConfig (165 fields) (~4169 tok)
- `utils.py` — URL configuration (~7504 tok)

## backend/venv/Lib/site-packages/fastapi/security/

- `__init__.py` (~252 tok)
- `api_key.py` — API: GET (3 endpoints) (~2798 tok)
- `base.py` — Declares SecurityBase (~41 tok)
- `http.py` — API: GET (3 endpoints) (~3832 tok)
- `oauth2.py` — API: POST (2 endpoints) (~6908 tok)
- `open_id_connect_url.py` — OpenIdConnect: make_not_authenticated_error (~896 tok)
- `utils.py` — get_authorization_scheme_param (~75 tok)

## backend/venv/Lib/site-packages/h11-0.16.0.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` (~2227 tok)
- `RECORD` (~488 tok)
- `top_level.txt` (~1 tok)
- `WHEEL` (~25 tok)

## backend/venv/Lib/site-packages/h11-0.16.0.dist-info/licenses/

- `LICENSE.txt` (~281 tok)

## backend/venv/Lib/site-packages/h11/

- `__init__.py` — A highish-level implementation of the HTTP/1.1 wire protocol (RFC 7230), (~431 tok)
- `_abnf.py` — We use native strings for all the re patterns, to take advantage of string (~1376 tok)
- `_connection.py` — This contains the main Connection class. Everything in h11 revolves around (~7676 tok)
- `_events.py` — High level events that make up HTTP/1.1 conversations. Loosely inspired by (~3370 tok)
- `_headers.py` — Headers: raw_items, normalize_and_validate, normalize_and_validate, normalize_and_validate + 4 more (~2975 tok)
- `_readers.py` — Code to read HTTP data (~2455 tok)
- `_receivebuffer.py` — ReceiveBuffer: maybe_extract_at_most, maybe_extract_next_line, maybe_extract_lines, is_next_line_obviously_invalid_request_line (~1501 tok)
- `_state.py` — ############################################################### (~3781 tok)
- `_util.py` — ProtocolError: validate, bytesify (~1397 tok)
- `_version.py` — This file must be kept very simple, because it is consumed from several (~196 tok)
- `_writers.py` — Code to read HTTP data (~1452 tok)
- `py.typed` (~2 tok)

## backend/venv/Lib/site-packages/httpcore-1.0.9.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — Declares html (~5741 tok)
- `RECORD` (~1270 tok)
- `WHEEL` (~24 tok)

## backend/venv/Lib/site-packages/httpcore-1.0.9.dist-info/licenses/

- `LICENSE.md` (~380 tok)

## backend/venv/Lib/site-packages/httpcore/

- `__init__.py` — Declares is (~985 tok)
- `_api.py` — request, stream (~899 tok)
- `_exceptions.py` — ConnectionNotAvailable: map_exceptions (~339 tok)
- `_models.py` — Functions for typechecking... (~5036 tok)
- `_ssl.py` — default_ssl_context (~54 tok)
- `_synchronization.py` — Our async synchronization primatives use either 'anyio' or 'trio' depending (~2696 tok)
- `_trace.py` — Trace: trace, atrace (~1130 tok)
- `_utils.py` — is_socket_readable (~440 tok)
- `py.typed` (~0 tok)

## backend/venv/Lib/site-packages/httpcore/_async/

- `__init__.py` — Declares AsyncHTTP2Connection (~349 tok)
- `connection_pool.py` — AsyncPoolRequest: assign_to_connection, clear_connection, wait_for_connection, is_queued + 3 more (~4945 tok)
- `connection.py` — AsyncHTTPConnection: exponential_backoff, handle_async_request, can_handle_request, aclose + 5 more (~2414 tok)
- `http_proxy.py` — AsyncHTTPProxy: merge_headers, create_connection, handle_async_request, can_handle_request + 7 more (~4201 tok)
- `http11.py` — HTTPConnectionState: handle_async_request, aclose, can_handle_request, is_available + 4 more (~3966 tok)
- `http2.py` — HTTPConnectionState: has_body_headers, handle_async_request (~6839 tok)
- `interfaces.py` — AsyncRequestInterface: request, stream, handle_async_request, aclose + 6 more (~1273 tok)
- `socks_proxy.py` — AsyncSOCKSProxy: create_connection, handle_async_request, can_handle_request (~3955 tok)

## backend/venv/Lib/site-packages/httpcore/_backends/

- `__init__.py` (~0 tok)
- `anyio.py` — AnyIOStream: read, write, aclose, start_tls + 4 more (~1501 tok)
- `auto.py` — AutoBackend: connect_tcp, connect_unix_socket, sleep (~475 tok)
- `base.py` — NetworkStream: read, write, close, start_tls + 12 more (~870 tok)
- `mock.py` — MockSSLObject: selected_alpn_protocol, read, write, close + 13 more (~1165 tok)
- `sync.py` — TLSinTLSStream: read, write, close, start_tls + 8 more (~2280 tok)
- `trio.py` — TrioStream: read, write, aclose, start_tls + 4 more (~1714 tok)

## backend/venv/Lib/site-packages/httpcore/_sync/

- `__init__.py` — Declares HTTP2Connection (~326 tok)
- `connection_pool.py` — PoolRequest: assign_to_connection, clear_connection, wait_for_connection, is_queued + 3 more (~4845 tok)
- `connection.py` — HTTPConnection: exponential_backoff, handle_request, can_handle_request, close + 5 more (~2354 tok)
- `http_proxy.py` — HTTPProxy: merge_headers, create_connection, handle_request, can_handle_request + 7 more (~4133 tok)
- `http11.py` — HTTPConnectionState: handle_request, close, can_handle_request, is_available + 5 more (~3851 tok)
- `http2.py` — HTTPConnectionState: has_body_headers, handle_request (~6686 tok)
- `interfaces.py` — RequestInterface: request, stream, handle_request, close + 6 more (~1242 tok)
- `socks_proxy.py` — SOCKSProxy: create_connection, handle_request, can_handle_request, close + 1 more (~3890 tok)

## backend/venv/Lib/site-packages/httptools-0.7.1.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — Declares for (~961 tok)
- `RECORD` (~532 tok)
- `top_level.txt` (~3 tok)
- `WHEEL` (~27 tok)

## backend/venv/Lib/site-packages/httptools-0.7.1.dist-info/licenses/

- `LICENSE` — Project license (~298 tok)

## backend/venv/Lib/site-packages/httptools/

- `__init__.py` (~44 tok)
- `_version.py` — This file MUST NOT contain anything but the __version__ assignment. (~168 tok)

## backend/venv/Lib/site-packages/httptools/parser/

- `__init__.py` (~60 tok)
- `cparser.pxd` — Declares char (~1372 tok)
- `errors.py` — Declares HttpParserError (~171 tok)
- `parser.cp314-win_amd64.pyd` (~33504 tok)
- `parser.pyi` — Declares HttpParser (~512 tok)
- `parser.pyx` — cython: language_level=3 (~4154 tok)
- `protocol.py` — HTTPProtocol: on_message_begin, on_url, on_header, on_headers_complete + 5 more (~160 tok)
- `python.pxd` (~39 tok)
- `url_cparser.pxd` — Declares http_parser_url_fields (~216 tok)
- `url_parser.cp314-win_amd64.pyd` (~13693 tok)
- `url_parser.pyi` — Declares URL (~158 tok)
- `url_parser.pyx` — cython: language_level=3 (~1031 tok)

## backend/venv/Lib/site-packages/httpx-0.28.1.dist-info/

- `entry_points.txt` (~10 tok)
- `INSTALLER` (~2 tok)
- `METADATA` — Declares html (~1880 tok)
- `RECORD` (~965 tok)
- `REQUESTED` (~0 tok)
- `WHEEL` (~24 tok)

## backend/venv/Lib/site-packages/httpx-0.28.1.dist-info/licenses/

- `LICENSE.md` (~377 tok)

## backend/venv/Lib/site-packages/httpx/

- `__init__.py` — main (~621 tok)
- `__version__.py` (~31 tok)
- `_api.py` — to: request, stream, get, options + 5 more (~3356 tok)
- `_auth.py` — Auth: auth_flow, sync_auth_flow, async_auth_flow, auth_flow + 4 more (~3398 tok)
- `_client.py` — UseClientDefault: close, aclose, is_closed, trust_env + 15 more (~18776 tok)
- `_config.py` — UnsetType: create_ssl_context, as_dict, raw_auth (~2442 tok)
- `_content.py` — ByteStream: encode_content, encode_urlencoded_data, encode_multipart_data, encode_text + 4 more (~2332 tok)
- `_decoders.py` — ContentDecoder: decode, flush, decode, flush + 18 more (~3441 tok)
- `_exceptions.py` — HTTPError: request, request, request_context (~2434 tok)
- `_main.py` — SQLAlchemy model (~4465 tok)
- `_models.py` — View: get, update (~12772 tok)
- `_multipart.py` — DataField: replacer, get_multipart_boundary_from_content_type, render_headers, render_data + 9 more (~2813 tok)
- `_status_codes.py` — codes: get_reason_phrase, is_informational, is_success, is_redirect + 3 more (~1612 tok)
- `_types.py` — SyncByteStream: close, aclose (~848 tok)
- `_urlparse.py` — URL configuration (~5299 tok)
- `_urls.py` — URL configuration (~6148 tok)
- `_utils.py` — URLPattern: primitive_value_to_str, get_environment_proxies, to_bytes, to_str + 7 more (~2368 tok)
- `py.typed` (~0 tok)

## backend/venv/Lib/site-packages/httpx/_transports/

- `__init__.py` (~79 tok)
- `asgi.py` — ASGIResponseStream: is_running_trio, create_event, handle_async_request, receive + 1 more (~1572 tok)
- `base.py` — BaseTransport: handle_request, close, handle_async_request, aclose (~721 tok)
- `default.py` — ResponseStream: map_httpcore_exceptions, close, handle_request, close + 1 more (~3996 tok)
- `mock.py` — MockTransport: handle_request, handle_async_request (~352 tok)
- `wsgi.py` — WSGIByteStream: close, handle_request, start_response (~1379 tok)

## backend/venv/Lib/site-packages/idna-3.11.dist-info/

- `INSTALLER` (~2 tok)
- `METADATA` — Declares issue (~2212 tok)
- `RECORD` (~372 tok)
- `WHEEL` (~22 tok)

## backend/venv/Lib/site-packages/idna-3.11.dist-info/licenses/

- `LICENSE.md` (~386 tok)

## backend/venv/Lib/site-packages/idna/

- `__init__.py` (~248 tok)
- `codec.py` — Codec: encode, decode, search_function (~983 tok)
- `compat.py` — ToASCII, ToUnicode, nameprep (~91 tok)
- `core.py` — IDNAError: valid_label_length, valid_string_length, check_bidi, check_initial_combiner + 9 more (~3785 tok)
- `idnadata.py` — This file is automatically generated by tools/idna-data (~22750 tok)
- `intranges.py` — intranges_from_list, intranges_contain (~543 tok)
- `package_data.py` (~6 tok)
- `py.typed` (~0 tok)
- `uts46data.py` — This file is automatically generated by tools/idna-data (~67061 tok)

## backend/venv/Lib/site-packages/multipart/

- `__init__.py` — you may not use this file except in compliance with the License. (~422 tok)
- `decoders.py` (~12 tok)
- `exceptions.py` (~12 tok)
- `multipart.py` (~12 tok)

## backend/venv/Lib/site-packages/pip/

- `__init__.py` — main (~101 tok)
- `__main__.py` — Remove '' and current working directory from the first entry (~244 tok)
- `__pip-runner__.py` — Execute exactly this copy of pip, within a different environment. (~415 tok)
- `py.typed` (~77 tok)

## backend/venv/Lib/site-packages/pip/_internal/

- `__init__.py` — init_logging() must be called before any call to logging.getLogger() (~146 tok)
- `build_env.py` — Build Environment used for isolation during sdist building (~4058 tok)
- `cache.py` — Cache Management (~2956 tok)
- `configuration.py` — Configuration management setup (~4163 tok)
- `exceptions.py` — Exceptions used throughout package. (~8453 tok)
- `main.py` — main (~97 tok)
- `pyproject.py` — URL configuration (~1302 tok)
- `self_outdated_check.py` — View: get (~2421 tok)
- `wheel_builder.py` — Orchestrator for building wheels from InstallRequirements. (~2575 tok)

## backend/venv/Lib/site-packages/pip/_internal/cli/

- `__init__.py` — Subpackage containing all of pip's command line interface related code (~38 tok)
- `autocompletion.py` — Logic that powers autocompletion installed by ``pip completion``. (~2056 tok)
- `base_command.py` — Base Command class, and related routines (~2491 tok)
- `cmdoptions.py` — PipOption: raise_option_error, make_option_group, check_dist_restriction, check_build_constraints + 5 more (~8865 tok)
- `command_context.py` — CommandContextMixIn: main_context, enter_context (~234 tok)
- `index_command.py` — SessionCommandMixin: get_default_session, handle_pip_version_check (~1634 tok)
- `main_parser.py` — A single place for constructing and exposing the main parser (~1237 tok)
- `main.py` — Primary application entrypoint. (~805 tok)
- `parser.py` — Base option parser setup (~3119 tok)
- `progress_bars.py` — SQLAlchemy model (~1334 tok)
- `req_command.py` — Contains the RequirementCommand base class. (~3943 tok)
- `spinners.py` — SpinnerInterface: spin, finish, spin, finish + 9 more (~2104 tok)
- `status_codes.py` (~34 tok)

## backend/venv/Lib/site-packages/pip/_internal/commands/

- `__init__.py` — with: create_command, get_similar_commands (~1151 tok)
- `cache.py` — URL configuration (~2352 tok)
- `check.py` — CheckCommand: run (~642 tok)
- `completion.py` — CompletionCommand: add_options, run (~1295 tok)
- `configuration.py` — ConfigurationCommand: add_options, handler_map, run, list_values + 7 more (~2888 tok)
- `debug.py` — DebugCommand: show_value, show_sys_implementation, create_vendor_txt_map, get_module_from_module_name + 7 more (~1945 tok)
- `download.py` — URL configuration (~1450 tok)
- `freeze.py` — URL configuration (~886 tok)
- `hash.py` — HashCommand: add_options, run (~480 tok)
- `help.py` — HelpCommand: run (~317 tok)
- `index.py` — IndexCommand: add_options, handler_map, run, get_available_package_versions (~1498 tok)
- `inspect.py` — URL configuration (~908 tok)
- `install.py` — URL configuration (~8707 tok)
- `list.py` — URL configuration (~3862 tok)
- `lock.py` — LockCommand: add_options, run (~1657 tok)
- `search.py` — TransformedHit: add_options, run, search, transform_hits + 4 more (~1652 tok)
- `show.py` — ShowCommand: normalize_project_url_label, add_options, run, search_packages_info + 1 more (~2305 tok)
- `uninstall.py` — UninstallCommand: add_options, run (~1106 tok)
- `wheel.py` — URL configuration (~1718 tok)

## backend/venv/Lib/site-packages/pip/_internal/distributions/

- `__init__.py` — make_distribution_for_install_requirement (~246 tok)
- `base.py` — AbstractDistribution: build_tracker_id, get_metadata_distribution, prepare_distribution_metadata (~523 tok)
- `installed.py` — InstalledDistribution: build_tracker_id, get_metadata_distribution, prepare_distribution_metadata (~266 tok)
- `sdist.py` — SourceDistribution: build_tracker_id, get_metadata_distribution, prepare_distribution_metadata (~1894 tok)
- `wheel.py` — WheelDistribution: build_tracker_id, get_metadata_distribution, prepare_distribution_metadata (~390 tok)

## backend/venv/Lib/site-packages/pip/_internal/index/

- `__init__.py` — Index interaction code (~9 tok)
- `collector.py` — from: with_cached_index_content, wrapper, wrapper_wrapper, parse_links + 2 more (~4625 tok)
- `package_finder.py` — Routines related to PyPI, indexes (~11096 tok)
- `sources.py` — URL configuration (~2469 tok)

## backend/venv/Lib/site-packages/pip/_internal/locations/

- `__init__.py` — URL configuration (~4053 tok)
- `_distutils.py` — Locations where we look for configs, install stuff, etc (~1708 tok)
- `_sysconfig.py` — get_scheme, get_bin_prefix, get_purelib, get_platlib (~2205 tok)
- `base.py` — Application Directories (~729 tok)

## backend/venv/Lib/site-packages/pip/_internal/metadata/

- `__init__.py` — Backend: select_backend, get_default_environment, get_environment, get_directory_distribution + 2 more (~1664 tok)
- `_json.py` — Extracted from https://github.com/pfmoore/pkg_metadata (~775 tok)
- `base.py` — URL configuration (~7263 tok)
- `pkg_resources.py` — URL configuration (~3013 tok)

## backend/venv/Lib/site-packages/pip/_internal/metadata/importlib/

- `__init__.py` (~39 tok)
- `_compat.py` — BadMetadata: name, parent, get_info_location, parse_name_and_version_from_info_directory + 1 more (~802 tok)
- `_dists.py` — URL patterns: 1 routes (~2406 tok)
- `_envs.py` — URL configuration (~1524 tok)

## backend/venv/Lib/site-packages/pip/_internal/models/

- `__init__.py` — A package that contains models that represent entities. (~18 tok)
- `candidate.py` — Declares from (~216 tok)
- `direct_url.py` — PEP 610 (~1873 tok)
- `format_control.py` — FormatControl: handle_mutual_excludes, get_allowed_formats, disallow_binaries (~706 tok)
- `index.py` — URL patterns: 2 routes (~295 tok)
- `installation_report.py` — InstallationReport: to_dict (~812 tok)
- `link.py` — URL configuration (~6227 tok)
- `pylock.py` — URL configuration (~1775 tok)
- `scheme.py` — Declares SCHEME_KEYS (~165 tok)
- `search_scope.py` — URL configuration (~1288 tok)
- `selection_prefs.py` — TODO: This needs Python 3.10's improved slots support for dataclasses (~576 tok)
- `target_python.py` — TargetPython: format_given, get_sorted_tags, get_unsorted_tags (~1213 tok)
- `wheel.py` — Represents a wheel file and provides access to the various parts of the (~835 tok)

## backend/venv/Lib/site-packages/pip/_internal/network/

- `__init__.py` — Contains purely network-related utilities. (~14 tok)
- `auth.py` — Network Authentication Helpers (~5909 tok)
- `cache.py` — HTTP cache implementation. (~1390 tok)
- `download.py` — Download files with progress indicators. (~3624 tok)
- `lazy_wheel.py` — Lazy ZIP over HTTP (~2185 tok)
- `session.py` — PipSession and supporting code, containing all pip-specific (~5483 tok)
- `utils.py` — The following comments and HTTP headers were originally added by (~1169 tok)
- `xmlrpc.py` — xmlrpclib.Transport implementation (~523 tok)

## backend/venv/Lib/site-packages/pip/_internal/operations/

- `__init__.py` (~0 tok)
- `check.py` — Validation of dependencies of packages (~1684 tok)
- `freeze.py` — URL configuration (~2816 tok)
- `prepare.py` — Prepares a distribution for installation (~8262 tok)

## backend/venv/Lib/site-packages/pip/_internal/operations/install/

- `__init__.py` — For modules related to installing packages. (~15 tok)
- `wheel.py` — Support for installing and building the "wheel" binary package format. (~7988 tok)

## backend/venv/Lib/site-packages/pip/_internal/req/

- `__init__.py` — from: install_given_reqs (~869 tok)
- `constructors.py` — Backing implementation for InstallRequirement's various constructors (~5309 tok)
- `req_dependency_group.py` — parse_dependency_groups (~748 tok)
- `req_file.py` — URL configuration (~5752 tok)
- `req_install.py` — URL configuration (~8936 tok)
- `req_set.py` — RequirementSet: add_unnamed_requirement, add_named_requirement, has_requirement, get_requirement + 2 more (~808 tok)
- `req_uninstall.py` — URL configuration (~6886 tok)

## backend/venv/Lib/site-packages/pip/_internal/resolution/

- `__init__.py` (~0 tok)
- `base.py` — BaseResolver: resolve, get_installation_order (~165 tok)

## backend/venv/Lib/site-packages/pip/_internal/resolution/legacy/

- `__init__.py` (~0 tok)
- `resolver.py` — Dependency Resolution (~6875 tok)

## backend/venv/Lib/site-packages/pip/_internal/resolution/resolvelib/

- `__init__.py` (~0 tok)
- `base.py` — from: format_name, empty, from_ireq, is_satisfied_by + 14 more (~1442 tok)
- `candidates.py` — URL configuration (~5844 tok)
- `factory.py` — ConflictCause: force_reinstall, iter_index_candidate_infos, is_pinned (~9608 tok)
- `found_candidates.py` — Utilities to lazily create and visit candidates found. (~1720 tok)
- `provider.py` — PipProvider: constraints, identify, narrow_requirement_selection, get_preference + 3 more (~3269 tok)
- `reporter.py` — PipReporter: rejecting_candidate, starting, starting_round, ending_round + 4 more (~1117 tok)
- `requirements.py` — ExplicitRequirement: project_name, name, format_for_error, get_candidate_lookup + 16 more (~2308 tok)
- `resolver.py` — Resolver: resolve, get_installation_order, get_topological_weights, visit (~3840 tok)

## backend/venv/Lib/site-packages/pip/_internal/utils/

- `__init__.py` (~0 tok)
- `_jaraco_text.py` — Functions brought over from jaraco.text. (~958 tok)
- `_log.py` — Customize logging (~290 tok)
- `appdirs.py` — user_cache_dir, user_config_dir, site_config_dirs (~481 tok)
- `compat.py` — Stuff that differs in different Python versions and platform (~719 tok)
- `compatibility_tags.py` — Generate and work with PEP 425 Compatibility Tags. (~1895 tok)
- `datetime.py` — For when pip wants to check the date or time. (~69 tok)
- `deprecation.py` — PipDeprecationWarning: install_warning_logger, deprecated (~1056 tok)
- `direct_url_helpers.py` — direct_url_as_pep440_direct_reference, direct_url_for_editable, direct_url_from_link (~915 tok)
- `egg_link.py` — URL configuration (~703 tok)
- `entrypoints.py` — get_best_invocation_for_this_pip, get_best_invocation_for_this_python (~950 tok)
- `filesystem.py` — check_path_owner, adjacent_tmp_file, test_writable_dir, find_files + 5 more (~1571 tok)
- `filetypes.py` — Filetype information. (~197 tok)
- `glibc.py` — glibc_version_string, glibc_version_string_confstr, glibc_version_string_ctypes, libc_ver (~1065 tok)
- `hashes.py` — URL configuration (~1428 tok)
- `logging.py` — from: indent_log, get_indentation, get_message_start, format + 7 more (~3460 tok)
- `misc.py` — URL configuration (~6679 tok)
- `packaging.py` — check_requires_python, get_requirement (~458 tok)
- `retry.py` — retry, wrapper, retry_wrapped (~418 tok)
- `subprocess.py` — make_command, format_command_args, reveal_command_args, call_subprocess + 2 more (~2567 tok)
- `temp_dir.py` — URL configuration (~2660 tok)
- `unpacking.py` — Utilities related archives. (~3706 tok)
- `urls.py` — URL configuration (~458 tok)
- `virtualenv.py` — URL configuration (~988 tok)
- `wheel.py` — Support functions for working with wheel files. (~1277 tok)

## backend/venv/Lib/site-packages/pip/_internal/vcs/

- `__init__.py` — Expose a limited set of classes and functions so callers outside of (~171 tok)
- `bazaar.py` — URL configuration (~1067 tok)
- `git.py` — URL configuration (~5470 tok)
- `mercurial.py` — URL configuration (~1593 tok)
- `subversion.py` — URL configuration (~3368 tok)
- `versioncontrol.py` — Handles all VCS (version control) support (~6430 tok)

## backend/venv/Lib/site-packages/pip/_vendor/

- `__init__.py` — URL configuration (~1402 tok)
- `README.rst` — Declares without (~2349 tok)
- `vendor.txt` (~86 tok)

## backend/venv/Lib/site-packages/pip/_vendor/cachecontrol/

- `__init__.py` — CacheControl import Interface. (~194 tok)
- `_cmd.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~497 tok)
- `adapter.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~1886 tok)
- `cache.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~558 tok)
- `controller.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~5458 tok)
- `filewrapper.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~1226 tok)
- `heuristics.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~1395 tok)
- `LICENSE.txt` (~140 tok)
- `py.typed` (~0 tok)
- `serialize.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~1476 tok)
- `wrapper.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~405 tok)

## backend/venv/Lib/site-packages/pip/_vendor/cachecontrol/caches/

- `__init__.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~87 tok)
- `file_cache.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~1177 tok)
- `redis_cache.py` — SPDX-FileCopyrightText: 2015 Eric Larson (~396 tok)

## backend/venv/Lib/site-packages/pip/_vendor/certifi/

- `__init__.py` (~27 tok)
- `__main__.py` (~73 tok)
- `cacert.pem` — Issuer: CN=Entrust Root Certification Authority O=Entrust, Inc. OU=www.entrust.net/CPS is incorporated by reference/(c) 2006 Entrust, Inc. (~77698 tok)

## docs/superpowers/plans/

- `2026-04-20-ink-code-review-fixes.md` — INK Code Review — Full Fix Implementation Plan (~14186 tok)
