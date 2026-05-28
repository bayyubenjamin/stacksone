;; Config updated 2026-05-28T07:36:35Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u2)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
