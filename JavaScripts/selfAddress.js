// $.smConfig.selfRawCitiesData = {
// 	"11": {
// 		"name": "北京",
// 		"sub": {
// 			"1101": {
// 				"name": "市辖区",
// 				"sub": {
// 					"110101": {
// 						"name": "东城区"
// 					},
// 					"110102": {
// 						"name": "西城区"
// 					},
// 					"110103": {
// 						"name": "崇文区"
// 					},
// 					"110104": {
// 						"name": "宣武区"
// 					},
// 					"110105": {
// 						"name": "朝阳区"
// 					},
// 					"110106": {
// 						"name": "丰台区"
// 					},
// 					"110107": {
// 						"name": "石景山区"
// 					},
// 					"110108": {
// 						"name": "海淀区"
// 					},
// 					"110109": {
// 						"name": "门头沟区"
// 					},
// 					"110111": {
// 						"name": "房山区"
// 					},
// 					"110112": {
// 						"name": "通州区"
// 					},
// 					"110113": {
// 						"name": "顺义区"
// 					},
// 					"110114": {
// 						"name": "昌平区"
// 					},
// 					"110115": {
// 						"name": "大兴区"
// 					},
// 					"110116": {
// 						"name": "怀柔区"
// 					},
// 					"110117": {
// 						"name": "平谷区"
// 					}
// 				}
// 			},
// 			"1102": {
// 				"name": "县",
// 				"sub": {
// 					"110228": {
// 						"name": "密云县"
// 					},
// 					"110229": {
// 						"name":"延庆县"
// 					}
// 				}
// 			}
// 		}
// 	}
// };
//$.smConfig.selfRawCitiesData = scloudcr;
+ function($) {
	"use strict";
	var format = function(data) {
	var result = {},
		values = [],
		displayValues = [],
		i = 0;
		for(var item in data) {
			values[i] = item;
			displayValues[i] = data[item].name;
			i++;
		}
		if(values.length) {
			result.values = values;
			result.displayValues = displayValues;
		};
		if(result) return result;
		return {};
	  };

	var sub = function(data) {
		if(!data.son) return [""];
		return format(data.son);
	};
	var getProvince = function() {
		var provinces = {},
			values = [],
			displayValues = [],
			i = 0;
		for(var item in raw) {
			values[i] = item;
			displayValues[i] = raw[item].name;
			i++
		}
		provinces.values = values;
		provinces.displayValues = displayValues;
		return provinces;
	}
	var getCities = function(d) {
		if(scloudcr[d]) return sub(scloudcr[d]);
		return [""];
	};

	var getDistricts = function(p, c) {
		if(scloudcr[p] && scloudcr[p].son && scloudcr[p].son[c]) return sub(scloudcr[p].son[c]);
		return [""];
	};
	//var raw = $.smConfig.selfRawCitiesData;
	var raw = scloudcr;
	var provinces = getProvince();
	var initCities = getCities(provinces.values[0]);
	var initDistricts = getDistricts(provinces.values[0],initCities.values[0]);
	console.log(initDistricts);
	var currentProvince = provinces.displayValues[0];
	var currentCity = initCities.displayValues[0];
	var currentDistrict = initDistricts.displayValues[0];

	var t;
	var defaults = {

	        cssClass: "city-picker",
	        rotateEffect: false,  //为了性能

	        onChange: function (picker, values, displayValues) {
	            	var newProvince = picker.cols[0].displayValue,
	            		newProvinceId = picker.cols[0].value;
	            var newCity,newCityId;

	              this.input.dataset.regionId = values[2];
	            if(newProvince !== currentProvince) {
	                // 如果Province变化，节流以提高reRender性能
	                clearTimeout(t);
	                this.input.dataset.regionId = values[2];
	                t = setTimeout(function(){
	                    var newCities = getCities(newProvinceId);
	                    newCity = newCities.displayValues[0];
	                    newCityId = newCities.values[0];
	                    var newDistricts = getDistricts(newProvinceId, newCityId);
	                    picker.cols[1].replaceValues(newCities.values,newCities.displayValues);
	                    picker.cols[2].replaceValues(newDistricts.values,newDistricts.displayValues);
	                    currentProvince = newProvince;
	                    currentCity = newCity;
	                    picker.updateValue();
	                }, 200);
	                return;
	            }
	            newCity = picker.cols[1].displayValue;
	            newCityId = picker.cols[1].value;
	            if(newCity !== currentCity) {
	            	var newDistricts = getDistricts(newProvinceId, newCityId);
	            	console.log(newDistricts);
	                picker.cols[2].replaceValues(newDistricts.values,newDistricts.displayValues);
	                currentCity = newCity;
	                picker.updateValue();
	            }
	        },

	        cols: [
		        {
		            textAlign: 'center',
		            values: provinces.values,
		            displayValues: provinces.displayValues,
		            cssClass: "col-province"
		        },
		        {
		            textAlign: 'center',
		            values: initCities.values,
		            displayValues: initCities.displayValues,
		            cssClass: "col-city"
		        },
		        {
		            textAlign: 'center',
		            values: initDistricts.values,
		            displayValues: initDistricts.displayValues,
		            cssClass: "col-district"
		        }
	        ],
	        formatValue: function(picker, values, displayValues) {
	        	this.input.value = displayValues.join(' ');
	        }
       };

    $.fn.selfCityPicker = function(params) {
        return this.each(function() {
            if(!this) return;
            var p = $.extend(defaults, params);
            //计算value
            if (p.value) {
                $(this).val(p.value.join(' '));
            } else {
                var val = $(this).val();
                val && (p.value = val.split(' '));
            }

            if (p.value) {
                //p.value = val.split(" ");
                if(p.value[0]) {
                    currentProvince = p.value[0];
                    p.cols[1].values = getCities(p.value[0]);
                }
                if(p.value[1]) {
                    currentCity = p.value[1];
                    p.cols[2].values = getDistricts(p.value[0], p.value[1]);
                } else {
                    p.cols[2].values = getDistricts(p.value[0], p.cols[1].values[0]);
                }
                !p.value[2] && (p.value[2] = '');
                currentDistrict = p.value[2];
            }
            $(this).picker(p);
        });
    };
}(Zepto);