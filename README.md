# expired-domain-crawler


## Monitoring

```
watch -d "redis-cli llen urls:todownload && redis-cli llen urls:tofilter && redis-cli zcard domain:lastNoMatchingDns && redis-cli zcard domain:lastAvailable"
```